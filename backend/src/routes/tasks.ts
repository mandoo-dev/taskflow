import { Hono } from 'hono';
import { jwt } from 'hono/jwt';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { db } from '../db';
import { tasks } from '../db/schema';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret';

const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.string().optional(),
});

const tasksRoute = new Hono();

// 모든 라우트에 JWT 인증 미들웨어 적용
tasksRoute.use('/*', jwt({ secret: JWT_SECRET, alg: 'HS256' }));

// GET /api/tasks — 본인의 태스크 목록 조회
tasksRoute.get('/', (c) => {
  const { sub: userId } = c.get('jwtPayload');
  const result = db.select().from(tasks).where(eq(tasks.userId, userId)).all();
  return c.json(result, 200);
});

// POST /api/tasks — 태스크 생성
tasksRoute.post('/', async (c) => {
  const { sub: userId } = c.get('jwtPayload');
  const body = await c.req.json();
  const parsed = createTaskSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  const id = crypto.randomUUID();
  const task = db
    .insert(tasks)
    .values({ id, userId, ...parsed.data })
    .returning()
    .get();

  return c.json(task, 201);
});

// PATCH /api/tasks/:id — 태스크 수정 (본인 소유만)
tasksRoute.patch('/:id', async (c) => {
  const { sub: userId } = c.get('jwtPayload');
  const taskId = c.req.param('id');
  const body = await c.req.json();
  const parsed = updateTaskSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
  }

  const updated = db
    .update(tasks)
    .set(parsed.data)
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
    .returning()
    .get();

  if (!updated) {
    return c.json({ error: 'Task not found' }, 404);
  }

  return c.json(updated, 200);
});

// DELETE /api/tasks/:id — 태스크 삭제 (본인 소유만)
tasksRoute.delete('/:id', (c) => {
  const { sub: userId } = c.get('jwtPayload');
  const taskId = c.req.param('id');

  const existing = db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
    .get();

  if (!existing) {
    return c.json({ error: 'Task not found' }, 404);
  }

  db.delete(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
    .run();

  return c.body(null, 204);
});

export default tasksRoute;
