import sqlite3 from 'sqlite3';
export declare const db: sqlite3.Database;
export declare function initializeDatabase(): Promise<void>;
export declare function dbRun(sql: string, params?: any[]): Promise<void>;
export declare function dbGet<T>(sql: string, params?: any[]): Promise<T | undefined>;
export declare function dbAll<T>(sql: string, params?: any[]): Promise<T[]>;
export default db;
//# sourceMappingURL=database.d.ts.map