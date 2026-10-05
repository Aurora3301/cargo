import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { sampleSite, type Site, validateSite } from './model';

function databasePath() {
  return process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'site.sqlite');
}

function openDatabase() {
  const file = databasePath();
  mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec('CREATE TABLE IF NOT EXISTS site (id INTEGER PRIMARY KEY CHECK (id = 1), body TEXT NOT NULL, updated_at TEXT NOT NULL)');
  return db;
}

export function getSite(): Site {
  const db = openDatabase();
  try {
    const row = db.prepare('SELECT body FROM site WHERE id = 1').get() as { body: string } | undefined;
    if (!row) {
      db.prepare('INSERT INTO site (id, body, updated_at) VALUES (1, ?, ?)').run(JSON.stringify(sampleSite), new Date().toISOString());
      return sampleSite;
    }
    return validateSite(JSON.parse(row.body));
  } finally { db.close(); }
}

export function saveSite(value: unknown): Site {
  const site = validateSite(value);
  const db = openDatabase();
  try {
    db.prepare('INSERT INTO site (id, body, updated_at) VALUES (1, ?, ?) ON CONFLICT(id) DO UPDATE SET body=excluded.body, updated_at=excluded.updated_at')
      .run(JSON.stringify(site), new Date().toISOString());
    return site;
  } finally { db.close(); }
}
