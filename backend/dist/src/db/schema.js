import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const users = sqliteTable('users', {
    id: text('id').primaryKey(),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
        .notNull()
        .$defaultFn(() => new Date()),
});
export const tasks = sqliteTable('tasks', {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description'),
    status: text('status').notNull().default('pending'),
    userId: text('user_id')
        .notNull()
        .references(() => users.id),
    createdAt: integer('created_at', { mode: 'timestamp' })
        .notNull()
        .$defaultFn(() => new Date()),
});
