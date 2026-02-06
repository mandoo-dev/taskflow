import { Hono } from 'hono';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { hash, compare } from 'bcryptjs';
import { sign } from 'hono/jwt';
import { db } from '../db';
import { users } from '../db/schema';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const auth = new Hono();

auth.post('/register', async (c) => {
  const body = await c.req.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  const { email, password } = parsed.data;

  const existing = db.select().from(users).where(eq(users.email, email)).get();
  if (existing) {
    // 동일 비밀번호면 idempotent 등록 (토큰 재발급)
    const match = await compare(password, existing.password);
    if (!match) {
      return c.json({ error: 'Email already exists' }, 409);
    }
    const token = await sign({ sub: existing.id, email }, JWT_SECRET);
    return c.json({ token, user: { id: existing.id, email } }, 201);
  }

  const hashedPassword = await hash(password, 10);
  const id = crypto.randomUUID();

  db.insert(users).values({ id, email, password: hashedPassword }).run();

  const token = await sign({ sub: id, email }, JWT_SECRET);

  return c.json({ token, user: { id, email } }, 201);
});

auth.post('/login', async (c) => {
  const body = await c.req.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  const { email, password } = parsed.data;

  const user = db.select().from(users).where(eq(users.email, email)).get();
  if (!user) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  const valid = await compare(password, user.password);
  if (!valid) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  const token = await sign({ sub: user.id, email: user.email }, JWT_SECRET);

  return c.json({ token, user: { id: user.id, email: user.email } }, 200);
});

export default auth;
