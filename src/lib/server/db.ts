import Database, { type Database as DBType } from 'better-sqlite3';

const IS_DEV_MODE = process.env.NODE_ENV !== 'production';
const DB_PATH = IS_DEV_MODE ? 'dev.db' : 'records.db';

console.log(process.env.NODE_ENV);
console.log(`Database Path: ${DB_PATH}`);

let db: DBType;

function openDB() {
  if (db) return db;

  db = new Database(DB_PATH);
  const initSql = `
        CREATE TABLE IF NOT EXISTS md (
           id INTEGER PRIMARY KEY AUTOINCREMENT,
           coin_flip TEXT NOT NULL CHECK (coin_flip IN ('head', 'tail')),
           duel_result TEXT NOT NULL CHECK (duel_result IN ('win', 'lose')),
           go_first INTEGER NOT NULL CHECK (go_first IN (0, 1)),     -- 1 (going first) or 0 (going second)
           created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS bo3_matches (
           match_id INTEGER PRIMARY KEY AUTOINCREMENT,
           vs_desk TEXT,
           created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS bo3_duels (
           duel_id INTEGER PRIMARY KEY AUTOINCREMENT,
           match_id INTEGER NOT NULL,
           game_number INTEGER NOT NULL CHECK (game_number IN (1, 2, 3)), -- (G1, G2, G3)
           duel_result TEXT NOT NULL CHECK (duel_result IN ('win', 'lose')),
           go_first INTEGER NOT NULL CHECK (go_first IN (0, 1)), -- 1 (going first) or 0 (going second)

           UNIQUE(match_id, game_number), 
           FOREIGN KEY (match_id) REFERENCES bo3_matches(match_id)
         );
    `;
  db.exec(initSql);
  console.log(`Database connected and initialized at ${DB_PATH}`);

  return db;
}

export const database = openDB();
