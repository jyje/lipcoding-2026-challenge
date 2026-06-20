import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

// SQLite 데이터베이스 연결
const dbPath = process.env.DB_PATH || path.join(process.cwd(), 'backend/data/thriveops.db');

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Database connection error:', err);
  } else {
    console.log('✅ Database connected:', dbPath);
  }
});

// 테이블 초기화
export async function initializeDatabase() {
  return new Promise<void>((resolve, reject) => {
    // Users 테이블
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        nickname TEXT UNIQUE NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        lastAccessAt TEXT NOT NULL
      )
    `, (err) => {
      if (err) {
        console.error('❌ Users table error:', err);
        reject(err);
      } else {
        console.log('✅ Users table created/verified');
      }
    });

    // User Sessions 테이블 (세션 추적용)
    db.run(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        token TEXT NOT NULL,
        expiresAt TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `, (err) => {
      if (err) {
        console.error('❌ Sessions table error:', err);
        reject(err);
      } else {
        console.log('✅ Sessions table created/verified');
      }
    });

    // User Insights 테이블 (분석 결과 저장)
    db.run(`
      CREATE TABLE IF NOT EXISTS insights (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        summary TEXT NOT NULL,
        topActions TEXT NOT NULL,
        risks TEXT,
        generatedAt TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `, (err) => {
      if (err) {
        console.error('❌ Insights table error:', err);
        reject(err);
      } else {
        console.log('✅ Insights table created/verified');
        resolve();
      }
    });
  });
}

// 데이터베이스 쿼리 헬퍼
export function dbRun(sql: string, params: any[] = []): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve();
    });
  });
}

export function dbGet<T>(sql: string, params: any[] = []): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row as T | undefined);
    });
  });
}

export function dbAll<T>(sql: string, params: any[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve((rows || []) as T[]);
    });
  });
}

export default db;
