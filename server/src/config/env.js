import dotenv from 'dotenv'

dotenv.config()

const toBoolean = (value, fallback = false) => {
  if (value === undefined) {
    return fallback
  }

  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase())
}

export const env = {
  port: Number(process.env.PORT || 5000),
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai-interview-app',
  jwtSecret: process.env.JWT_SECRET || 'development-secret',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  openAiApiKey: process.env.OPENAI_API_KEY || '',
  openAiModel: process.env.OPENAI_MODEL || 'gpt-5-mini',
  allowMockAi: toBoolean(process.env.ALLOW_MOCK_AI, true),
  isProduction: process.env.NODE_ENV === 'production'
}

