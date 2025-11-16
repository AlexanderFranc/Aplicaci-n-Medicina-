import bcrypt from 'bcryptjs'
import { initDb, getDb } from '../lib/db.js'

async function main() {
  await initDb()
  const db = getDb()
  await db.run('UPDATE users SET email = REPLACE(email, "@salud.edu", "@uisek.edu.ec") WHERE role = "estudiante" AND email LIKE "%@salud.edu%"')
  const count = await db.get('SELECT COUNT(*) as c FROM users WHERE role = "estudiante"')

  const hash = await bcrypt.hash('Clave123', 10)
  await db.exec('BEGIN')
  for (let i = count.c + 1; i <= 1000; i++) {
    const num = String(i).padStart(4, '0')
    const name = `Estudiante ${num}`
    const email = `est${num}@uisek.edu.ec`
    await db.run('INSERT INTO users (name, email, password_hash, role) VALUES (?,?,?,?)', name, email, hash, 'estudiante')
  }
  for (let i = 1; i <= 30; i++) {
    const num = String(i).padStart(4, '0')
    const name = `Docente ${num}`
    const email = `doc${num}@uisek.edu.ec`
    const exists = await db.get('SELECT id FROM users WHERE email = ?', email)
    if (!exists) await db.run('INSERT INTO users (name, email, password_hash, role) VALUES (?,?,?,?)', name, email, hash, 'profesor')
  }
  for (let i = 1; i <= 10; i++) {
    const num = String(i).padStart(4, '0')
    const name = `Medico ${num}`
    const email = `med${num}@uisek.edu.ec`
    const exists = await db.get('SELECT id FROM users WHERE email = ?', email)
    if (!exists) await db.run('INSERT INTO users (name, email, password_hash, role) VALUES (?,?,?,?)', name, email, hash, 'medico')
  }
  await db.exec('COMMIT')
  console.log('Seed completado: estudiantes y docentes/medicos creados con contraseña "Clave123"')
}

main().catch(e => { console.error(e); process.exit(1) })