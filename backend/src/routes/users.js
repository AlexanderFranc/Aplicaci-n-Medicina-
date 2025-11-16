import express from 'express'
import { authMiddleware } from '../lib/auth.js'
import { getDb } from '../lib/db.js'

const router = express.Router()

router.get('/', authMiddleware(['profesor','medico']), async (req, res) => {
  const db = getDb()
  const role = req.query.role || 'estudiante'
  const q = (req.query.q || '').trim()
  const limit = Math.min(parseInt(req.query.limit || '20'), 100)
  const offset = parseInt(req.query.offset || '0')
  let where = 'WHERE role = ?'
  let params = [role]
  if (q) {
    where += ' AND (name LIKE ? OR email LIKE ?)'
    params.push(`%${q}%`, `%${q}%`)
  }
  const rows = await db.all(`SELECT id, name, email, role FROM users ${where} ORDER BY id ASC LIMIT ? OFFSET ?`, ...params, limit, offset)
  res.json({ users: rows })
})

export default router