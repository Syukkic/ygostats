import Database, { type Database as DBType } from 'better-sqlite3';

const DB_PATH = 'records.db';

let db: DBType;

function openDB() {
	if (db) return db;

	db = new Database(DB_PATH);
	const initSql = `
        CREATE TABLE IF NOT EXISTS records (
           id INTEGER PRIMARY KEY AUTOINCREMENT,
           coin_flip TEXT NOT NULL CHECK (coin_flip IN ('head', 'tail')),
           match_result TEXT NOT NULL CHECK (match_result IN ('win', 'lose')),
           is_first INTEGER NOT NULL CHECK (is_first IN (0, 1)),     -- 1 (going first) or 0 (going second)
           created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
    `;
	db.exec(initSql);
	console.log(`Database connected and initialized at ${DB_PATH}`);

	return db;
}

export const database = openDB();
