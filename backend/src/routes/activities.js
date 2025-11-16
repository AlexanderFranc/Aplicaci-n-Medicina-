import express from 'express'
import { z } from 'zod'
import { getDb } from '../lib/db.js'
import { authMiddleware } from '../lib/auth.js'

const router = express.Router()

const createSchema = z.object({
  user_id: z.number().int().positive(),
  placement_id: z.number().int().positive(),
  titulo: z.string().min(3),
  descripcion: z.string().optional(),
  horas: z.number().min(0).optional(),
  fecha: z.string().optional(),
  doctor_id: z.number().int().positive().optional(),
  hospital: z.string().min(2).optional()
})

router.post('/', authMiddleware(['profesor']), async (req, res) => {
  const parse = createSchema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() })
  const { user_id, placement_id, titulo, descripcion = null, horas = null, fecha, doctor_id = null, hospital = null } = parse.data
  const db = getDb()
  const f = fecha || new Date().toISOString().slice(0, 10)
  const result = await db.run(
    'INSERT INTO activities (user_id, placement_id, titulo, descripcion, horas, fecha, estado, doctor_id, hospital) VALUES (?,?,?,?,?,?,?,?,?)',
    user_id, placement_id, titulo, descripcion, horas, f, 'pendiente', doctor_id, hospital
  )
  res.status(201).json({ id: result.lastID })
})

router.get('/my', authMiddleware(['estudiante']), async (req, res) => {
  const db = getDb()
  const rows = await db.all(
    `SELECT a.*, p.nombre as placement_nombre, u.name as doctor_name
     FROM activities a JOIN placements p ON a.placement_id = p.id
     LEFT JOIN users u ON a.doctor_id = u.id
     WHERE a.user_id = ? ORDER BY a.id DESC`,
    req.user.id
  )
  res.json({ activities: rows })
})

router.get('/:id', authMiddleware(), async (req, res) => {
  const db = getDb()
  const act = await db.get(
    `SELECT a.*, u.name as doctor_name
     FROM activities a LEFT JOIN users u ON a.doctor_id = u.id
     WHERE a.id = ?`,
    req.params.id
  )
  if (!act) return res.status(404).json({ error: 'Actividad no encontrada' })
  const evals = await db.all(
    `SELECT e.*, u.name as evaluator_name, u.role as evaluator_role
     FROM evaluations e JOIN users u ON e.evaluator_id = u.id
     WHERE e.activity_id = ? ORDER BY e.id DESC`,
    req.params.id
  )
  res.json({ activity: act, evaluations: evals })
})

export default router