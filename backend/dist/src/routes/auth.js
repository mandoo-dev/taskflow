"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const zod_1 = require("zod");
const drizzle_orm_1 = require("drizzle-orm");
const bcryptjs_1 = require("bcryptjs");
const jwt_1 = require("hono/jwt");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret';
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
});
const auth = new hono_1.Hono();
auth.post('/register', async (c) => {
    const body = await c.req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
        return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
    }
    const { email, password } = parsed.data;
    const existing = db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.email, email)).get();
    if (existing) {
        // 동일 비밀번호면 idempotent 등록 (토큰 재발급)
        const match = await (0, bcryptjs_1.compare)(password, existing.password);
        if (!match) {
            return c.json({ error: 'Email already exists' }, 409);
        }
        const token = await (0, jwt_1.sign)({ sub: existing.id, email }, JWT_SECRET);
        return c.json({ token, user: { id: existing.id, email } }, 201);
    }
    const hashedPassword = await (0, bcryptjs_1.hash)(password, 10);
    const id = crypto.randomUUID();
    db_1.db.insert(schema_1.users).values({ id, email, password: hashedPassword }).run();
    const token = await (0, jwt_1.sign)({ sub: id, email }, JWT_SECRET);
    return c.json({ token, user: { id, email } }, 201);
});
auth.post('/login', async (c) => {
    const body = await c.req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
        return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
    }
    const { email, password } = parsed.data;
    const user = db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.email, email)).get();
    if (!user) {
        return c.json({ error: 'Invalid credentials' }, 401);
    }
    const valid = await (0, bcryptjs_1.compare)(password, user.password);
    if (!valid) {
        return c.json({ error: 'Invalid credentials' }, 401);
    }
    const token = await (0, jwt_1.sign)({ sub: user.id, email: user.email }, JWT_SECRET);
    return c.json({ token, user: { id: user.id, email: user.email } }, 200);
});
exports.default = auth;
