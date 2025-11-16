import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { initDb } from './lib/db.js'
import { initLogDb } from './lib/logdb.js'
import authRouter from './routes/auth.js'
import attendanceRouter from './routes/attendance.js'
import activitiesRouter from './routes/activities.js'
import evaluationsRouter from './routes/evaluations.js'
import reviewsRouter from './routes/reviews.js'
import placementsRouter from './routes/placements.js'
import usersRouter from './routes/users.js'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

await initDb()
await initLogDb()

app.get('/', (req, res) => {
  res.json({ ok: true, name: 'API Ciencias de la Salud', version: '0.1.0' })
})

app.use('/auth', authRouter)
app.use('/attendances', attendanceRouter)
app.use('/activities', activitiesRouter)
app.use('/evaluations', evaluationsRouter)
app.use('/reviews', reviewsRouter)
app.use('/placements', placementsRouter)
app.use('/users', usersRouter)

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Error interno' })
})

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`)
})