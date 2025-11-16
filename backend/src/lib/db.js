import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

let db

export async function initDb() {
  if (db) return db
  db = await open({ filename: './data.db', driver: sqlite3.Database })
  await db.exec('PRAGMA foreign_keys = ON;')

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('estudiante','profesor','medico')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `)

  await db.exec(`
    CREATE TABLE IF NOT EXISTS placements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      tipo TEXT NOT NULL CHECK(tipo IN ('clinica','hospital','otro')),
      ubicacion TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `)

  await db.exec(`
    CREATE TABLE IF NOT EXISTS attendances (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      placement_id INTEGER NOT NULL,
      check_in TEXT NOT NULL,
      check_out TEXT,
      estado TEXT NOT NULL CHECK(estado IN ('presente','finalizado')),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(placement_id) REFERENCES placements(id) ON DELETE CASCADE
    );
  `)

  await db.exec(`
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      placement_id INTEGER NOT NULL,
      titulo TEXT NOT NULL,
      descripcion TEXT,
      horas REAL,
      fecha TEXT NOT NULL,
      estado TEXT NOT NULL CHECK(estado IN ('pendiente','completada')),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(placement_id) REFERENCES placements(id) ON DELETE CASCADE
    );
  `)

  const cols = await db.all("PRAGMA table_info('activities')")
  const names = new Set(cols.map(c => c.name))
  if (!names.has('doctor_id')) {
    await db.exec('ALTER TABLE activities ADD COLUMN doctor_id INTEGER')
  }
  if (!names.has('hospital')) {
    await db.exec('ALTER TABLE activities ADD COLUMN hospital TEXT')
  }

  await db.exec(`
    CREATE TABLE IF NOT EXISTS evaluations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      activity_id INTEGER NOT NULL,
      evaluator_id INTEGER NOT NULL,
      puntaje INTEGER NOT NULL CHECK(puntaje BETWEEN 1 AND 5),
      comentario TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(activity_id) REFERENCES activities(id) ON DELETE CASCADE,
      FOREIGN KEY(evaluator_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `)

  await db.exec(`
    CREATE TABLE IF NOT EXISTS student_placements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      placement_id INTEGER NOT NULL,
      start_date TEXT,
      end_date TEXT,
      UNIQUE(user_id, placement_id),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(placement_id) REFERENCES placements(id) ON DELETE CASCADE
    );
  `)

  // Seed básico de placements si vacío
  const countPlacements = await db.get('SELECT COUNT(*) as c FROM placements')
  if (countPlacements.c === 0) {
    await db.run(
      'INSERT INTO placements (nombre, tipo, ubicacion) VALUES (?,?,?), (?,?,?)',
      'Hospital Central', 'hospital', 'Centro',
      'Clínica Universitaria', 'clinica', 'Campus'
    )
  }

  return db
}

export function getDb() {
  if (!db) throw new Error('DB no inicializada')
  return db
}