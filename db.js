const Database = require('better-sqlite3');
const { mkdirSync } = require('fs');
const { join } = require('path');

let db;

function getDb() {
  if (db) return db;

  const dbPath = join(__dirname, 'data', 'launchkit.db');
  mkdirSync(join(__dirname, 'data'), { recursive: true });

  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('busy_timeout = 5000');
  db.pragma('synchronous = NORMAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS pages (
      slug       TEXT PRIMARY KEY,
      title      TEXT NOT NULL,
      config     TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);

  return db;
}

module.exports = { getDb };
