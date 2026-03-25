import app from './app.js'
import { connectToDatabase } from './config/database.js'
import { env } from './config/env.js'

const start = async () => {
  await connectToDatabase()
  app.listen(env.port, () => {
    console.log(`API server listening on http://localhost:${env.port}`)
  })
}

start().catch((error) => {
  console.error('Failed to start server', error)
  process.exit(1)
})

