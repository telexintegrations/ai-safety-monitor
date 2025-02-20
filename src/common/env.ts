import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const configSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  TELEX_RETURN_URL: z.string(),
  TELEX_CHANNEL_ID: z.string(),
  WEBSITE_URL: z.string(),
})

const validateConfig = (config: Record<string, unknown>) => {
  try {
    return configSchema.parse(config)
  } catch (error) {
    if (error instanceof Error) {
      console.error('Invalid configuration:', error.message)
    } else {
      console.error('Invalid configuration:', error)
    }
    process.exit(1)
  }
}

export const envConfig = validateConfig(process.env)
