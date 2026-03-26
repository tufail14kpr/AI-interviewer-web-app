import cors from 'cors'
import express from 'express'
import authRoutes from './routes/authRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import interviewRoutes from './routes/interviewRoutes.js'
import reportRoutes from './routes/reportRoutes.js'
import { env } from './config/env.js'
import { requireAdmin, requireAuth } from './middleware/auth.js'
import { errorHandler, notFoundHandler } from './middleware/error.js'

const app = express()

app.use(
  cors({
    origin: env.clientOrigin
  })
)
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_request, response) => {
  response.json({
    ok: true
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/admin', requireAuth, requireAdmin, adminRoutes)
app.use('/api/interviews', requireAuth, interviewRoutes)
app.use('/api/reports', requireAuth, reportRoutes)

app.use(notFoundHandler)
app.use(errorHandler)

export default app
