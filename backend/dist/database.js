"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.initializeDatabase = initializeDatabase;
exports.dbRun = dbRun;
exports.dbGet = dbGet;
exports.dbAll = dbAll;
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// SQLite 데이터베이스 연결
const dbPath = process.env.DB_PATH || path_1.default.join(process.cwd(), 'backend/data/lifeos.db');
// Ensure data directory exists
const dataDir = path_1.default.dirname(dbPath);
if (!fs_1.default.existsSync(dataDir)) {
    fs_1.default.mkdirSync(dataDir, { recursive: true });
}
exports.db = new sqlite3_1.default.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Database connection error:', err);
    }
    else {
        console.log('✅ Database connected:', dbPath);
    }
});
// 테이블 초기화
async function initializeDatabase() {
    return new Promise((resolve, reject) => {
        // Users 테이블
        exports.db.run(`
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
            }
            else {
                console.log('✅ Users table created/verified');
            }
        });
        // User Sessions 테이블 (세션 추적용)
        exports.db.run(`
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
            }
            else {
                console.log('✅ Sessions table created/verified');
            }
        });
        // User Insights 테이블 (분석 결과 저장)
        exports.db.run(`
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
            }
            else {
                console.log('✅ Insights table created/verified');
                resolve();
            }
        });
    });
}
// 데이터베이스 쿼리 헬퍼
function dbRun(sql, params = []) {
    return new Promise((resolve, reject) => {
        exports.db.run(sql, params, function (err) {
            if (err)
                reject(err);
            else
                resolve();
        });
    });
}
function dbGet(sql, params = []) {
    return new Promise((resolve, reject) => {
        exports.db.get(sql, params, (err, row) => {
            if (err)
                reject(err);
            else
                resolve(row);
        });
    });
}
function dbAll(sql, params = []) {
    return new Promise((resolve, reject) => {
        exports.db.all(sql, params, (err, rows) => {
            if (err)
                reject(err);
            else
                resolve((rows || []));
        });
    });
}
exports.default = exports.db;
//# sourceMappingURL=database.js.map