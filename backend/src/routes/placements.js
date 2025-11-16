import express from 'express'
import { z } from 'zod'
import { getDb } from '../lib/db.js'
import { authMiddleware } from '../lib/auth.js'

const router = express.Router()

router.get('/', authMiddleware(), async (req, res) => {
  const db = getDb()
  const rows = await db.all('SELECT * FROM placements ORDER BY id ASC')
  res.json({ placements: rows })
})

router.get('/my', authMiddleware(['estudiante']), async (req, res) => {
  const db = getDb()
  const rows = await db.all(
    `SELECT sp.placement_id as id, p.nombre, p.tipo, p.ubicacion
     FROM student_placements sp JOIN placements p ON sp.placement_id = p.id
     WHERE sp.user_id = ? ORDER BY p.id ASC`,
    req.user.id
  )
  res.json({ placements: rows })
})

const assignSchema = z.object({ user_id: z.number().int().positive(), placement_id: z.number().int().positive() })

router.post('/assign', authMiddleware(['profesor','medico']), async (req, res) => {
  const parse = assignSchema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() })
  const { user_id, placement_id } = parse.data
  const db = getDb()
  const user = await db.get('SELECT id, role FROM users WHERE id = ?', user_id)
  if (!user || user.role !== 'estudiante') return res.status(404).json({ error: 'Estudiante no válido' })
  const place = await db.get('SELECT id FROM placements WHERE id = ?', placement_id)
  if (!place) return res.status(404).json({ error: 'Lugar no existe' })
  await db.run('INSERT OR IGNORE INTO student_placements (user_id, placement_id, start_date) VALUES (?,?,?)', user_id, placement_id, new Date().toISOString())
  res.status(201).json({ ok: true })
})

export default router