import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
const sqlite = new Database(process.env.DATABASE_URL ?? ':memory:');
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');
export const db = drizzle(sqlite, { schema });
// 테이블 생성 (마이그레이션 대신 직접 실행)
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    user_id TEXT NOT NULL REFERENCES users(id),
    created_at INTEGER NOT NULL
  );
`);
