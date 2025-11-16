import express from 'express'
import { z } from 'zod'
import { getDb } from '../lib/db.js'
import { authMiddleware } from '../lib/auth.js'

const router = express.Router()

const createSchema = z.object({
  activity_id: z.number().int().positive(),
  puntaje: z.number().int().min(1).max(5),
  comentario: z.string().optional()
})

router.post('/', authMiddleware(['profesor','medico']), async (req, res) => {
  const parse = createSchema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() })
  const { activity_id, puntaje, comentario = null } = parse.data
  const db = getDb()
  const act = await db.get('SELECT * FROM activities WHERE id = ?', activity_id)
  if (!act) return res.status(404).json({ error: 'Actividad no encontrada' })
  const result = await db.run(
    'INSERT INTO evaluations (activity_id, evaluator_id, puntaje, comentario) VALUES (?,?,?,?)',
    activity_id, req.user.id, puntaje, comentario
  )
  // marcar actividad como completada si tiene al menos una evaluación
  await db.run('UPDATE activities SET estado = ? WHERE id = ?', 'completada', activity_id)
  res.status(201).json({ id: result.lastID })
})

export default router