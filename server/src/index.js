import http from 'node:http'
import app from './app.js'
import { connectToDatabase } from './config/database.js'
import { env } from './config/env.js'

const server = http.createServer(app)

const handleServerError = (error) => {
  if (error?.code === 'EADDRINUSE') {
    console.error(
      `Port ${env.port} is already in use. Another API server is already running. Stop the existing process or change PORT in server/.env before starting a new server.`
    )
    process.exit(1)
  }

  console.error('Server failed to start', error)
  process.exit(1)
}

const start = async () => {
  await connectToDatabase()
  server.listen(env.port, () => {
    console.log(`API server listening on http://localhost:${env.port}`)
  })
}

server.on('error', handleServerError)

start().catch((error) => {
  console.error('Failed to start server', error)
  process.exit(1)
})
