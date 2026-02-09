"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const jwt_1 = require("hono/jwt");
const zod_1 = require("zod");
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret';
const createTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
});
const updateTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).optional(),
    description: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
});
const tasksRoute = new hono_1.Hono();
// 모든 라우트에 JWT 인증 미들웨어 적용
tasksRoute.use('/*', (0, jwt_1.jwt)({ secret: JWT_SECRET, alg: 'HS256' }));
// GET /api/tasks — 본인의 태스크 목록 조회
tasksRoute.get('/', (c) => {
    const { sub: userId } = c.get('jwtPayload');
    const result = db_1.db.select().from(schema_1.tasks).where((0, drizzle_orm_1.eq)(schema_1.tasks.userId, userId)).all();
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
    const task = db_1.db
        .insert(schema_1.tasks)
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
    const updated = db_1.db
        .update(schema_1.tasks)
        .set(parsed.data)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.tasks.id, taskId), (0, drizzle_orm_1.eq)(schema_1.tasks.userId, userId)))
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
    const existing = db_1.db
        .select()
        .from(schema_1.tasks)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.tasks.id, taskId), (0, drizzle_orm_1.eq)(schema_1.tasks.userId, userId)))
        .get();
    if (!existing) {
        return c.json({ error: 'Task not found' }, 404);
    }
    db_1.db.delete(schema_1.tasks)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.tasks.id, taskId), (0, drizzle_orm_1.eq)(schema_1.tasks.userId, userId)))
        .run();
    return c.body(null, 204);
});
exports.default = tasksRoute;
