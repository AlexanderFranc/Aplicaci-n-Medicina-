import express from 'express'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { getDb } from '../lib/db.js'
import { signToken, authMiddleware } from '../lib/auth.js'

const router = express.Router()

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['estudiante','profesor','medico'])
})

router.post('/register', async (req, res) => {
  const parse = registerSchema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() })
  const { name, email, password, role } = parse.data
  const db = getDb()
  const exists = await db.get('SELECT id FROM users WHERE email = ?', email)
  if (exists) return res.status(409).json({ error: 'Email ya registrado' })
  const hash = await bcrypt.hash(password, 10)
  const result = await db.run(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?,?,?,?)',
    name, email, hash, role
  )
  const user = { id: result.lastID, name, email, role }
  const token = signToken(user)
  res.status(201).json({ user, token })
})

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(6) })

router.post('/login', async (req, res) => {
  const parse = loginSchema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() })
  const { email, password } = parse.data
  const db = getDb()
  const user = await db.get('SELECT * FROM users WHERE email = ?', email)
  if (!user) return res.status(401).json({ error: 'Credenciales inválidas' })
  const ok = await bcrypt.compare(password, user.password_hash)
  if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' })
  const token = signToken({ id: user.id, name: user.name, email: user.email, role: user.role })
  res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token })
})

router.get('/me', authMiddleware(), async (req, res) => {
  const db = getDb()
  const u = await db.get('SELECT id, name, email, role, created_at FROM users WHERE id = ?', req.user.id)
  res.json({ user: u })
})

export default router