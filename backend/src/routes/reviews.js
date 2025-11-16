import express from 'express'
import { getDb } from '../lib/db.js'
import { authMiddleware } from '../lib/auth.js'

const router = express.Router()

router.get('/pending', authMiddleware(['profesor','medico']), async (req, res) => {
  const db = getDb()
  const rows = await db.all(
    `SELECT a.id as activity_id, a.titulo, a.descripcion, a.fecha, u.id as user_id, u.name as user_name, u.email as user_email, p.nombre as placement_nombre
     FROM activities a
     JOIN users u ON a.user_id = u.id
     JOIN placements p ON a.placement_id = p.id
     WHERE a.estado = 'pendiente'
     ORDER BY a.id DESC`
  )
  res.json({ pending: rows })
})

export default router