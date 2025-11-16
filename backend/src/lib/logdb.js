import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

let logDb

export async function initLogDb() {
  if (logDb) return logDb
  logDb = await open({ filename: './logs.db', driver: sqlite3.Database })
  await logDb.exec('PRAGMA foreign_keys = ON;')
  await logDb.exec(`
    CREATE TABLE IF NOT EXISTS attendance_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      attendance_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      placement_id INTEGER NOT NULL,
      event TEXT NOT NULL CHECK(event IN ('check_in','check_out')),
      timestamp TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `)
  return logDb
}

export function getLogDb() {
  if (!logDb) throw new Error('Log DB no inicializada')
  return logDb
}