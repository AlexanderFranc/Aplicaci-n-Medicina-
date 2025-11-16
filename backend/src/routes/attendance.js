import express from 'express'
import { z } from 'zod'
import { getDb } from '../lib/db.js'
import { authMiddleware } from '../lib/auth.js'
import { getLogDb } from '../lib/logdb.js'

const router = express.Router()

const checkInSchema = z.object({ placement_id: z.number().int().positive().optional() })

router.post('/check-in', authMiddleware(['estudiante']), async (req, res) => {
  const parse = checkInSchema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() })
  const { placement_id } = parse.data
  const db = getDb()
  const open = await db.get('SELECT id FROM attendances WHERE user_id = ? AND check_out IS NULL', req.user.id)
  if (open) return res.status(400).json({ error: 'Ya tienes asistencia abierta' })
  const today = await db.get('SELECT id FROM attendances WHERE user_id = ? AND DATE(check_in) = DATE("now")', req.user.id)
  if (today) return res.status(400).json({ error: 'Solo se permite un registro por día' })
  let pid = placement_id
  if (!pid) {
    const assigned = await db.get('SELECT placement_id FROM student_placements WHERE user_id = ? ORDER BY id DESC LIMIT 1', req.user.id)
    if (!assigned) return res.status(403).json({ error: 'Sin lugar asignado por docente' })
    pid = assigned.placement_id
  }
  const place = await db.get('SELECT id FROM placements WHERE id = ?', pid)
  if (!place) return res.status(404).json({ error: 'Lugar no existe' })
  const now = new Date().toISOString()
  const result = await db.run(
    'INSERT INTO attendances (user_id, placement_id, check_in, estado) VALUES (?,?,?,?)',
    req.user.id, pid, now, 'presente'
  )
  const ldb = getLogDb()
  await ldb.run('INSERT INTO attendance_events (attendance_id, user_id, placement_id, event, timestamp) VALUES (?,?,?,?,?)', result.lastID, req.user.id, pid, 'check_in', now)
  res.status(201).json({ id: result.lastID, check_in: now })
})

router.post('/check-out', authMiddleware(['estudiante']), async (req, res) => {
  const db = getDb()
  const open = await db.get('SELECT * FROM attendances WHERE user_id = ? AND check_out IS NULL', req.user.id)
  if (!open) return res.status(400).json({ error: 'No hay asistencia abierta' })
  const now = new Date().toISOString()
  await db.run('UPDATE attendances SET check_out = ?, estado = ? WHERE id = ?', now, 'finalizado', open.id)
  const ldb = getLogDb()
  await ldb.run('INSERT INTO attendance_events (attendance_id, user_id, placement_id, event, timestamp) VALUES (?,?,?,?,?)', open.id, req.user.id, open.placement_id, 'check_out', now)
  res.json({ id: open.id, check_out: now })
})

router.get('/my', authMiddleware(['estudiante']), async (req, res) => {
  const db = getDb()
  const rows = await db.all(
    `SELECT a.*, p.nombre as placement_nombre, p.tipo as placement_tipo
     FROM attendances a JOIN placements p ON a.placement_id = p.id
     WHERE a.user_id = ? ORDER BY a.id DESC`,
    req.user.id
  )
  res.json({ attendances: rows })
})

router.get('/all', authMiddleware(['profesor','medico']), async (req, res) => {
  const db = getDb()
  const where = []
  const params = []
  const userId = parseInt(req.query.user_id || '')
  const placementId = parseInt(req.query.placement_id || '')
  const start = (req.query.start_date || '').trim()
  const end = (req.query.end_date || '').trim()
  if (!isNaN(userId)) { where.push('a.user_id = ?'); params.push(userId) }
  if (!isNaN(placementId)) { where.push('a.placement_id = ?'); params.push(placementId) }
  if (start) { where.push('DATE(a.check_in) >= DATE(?)'); params.push(start) }
  if (end) { where.push('DATE(a.check_in) <= DATE(?)'); params.push(end) }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
  const rows = await db.all(
    `SELECT a.*, u.name as user_name, u.email as user_email, p.nombre as placement_nombre, p.tipo as placement_tipo
     FROM attendances a
     JOIN users u ON a.user_id = u.id
     JOIN placements p ON a.placement_id = p.id
     ${whereSql}
     ORDER BY a.id DESC`,
     ...params
  )
  res.json({ attendances: rows })
})

export default router