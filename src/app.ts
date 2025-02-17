import express, { Application, Request, Response } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import unknownEndpoint from './middlewares/unknownEndpoint'
import { requestLogger } from './middlewares/requestLogger'

// to use env variables
import './common/env'
import { SafetyController } from './controllers/safetyController'
import { telexGeneratedConfig } from './utils/integrationConfig'

const app: Application = express()

// middleware
app.disable('x-powered-by')
app.use(cors())
app.use(helmet())
app.use(compression())
app.use(requestLogger)
app.use(
  express.urlencoded({
    extended: true,
    limit: process.env.REQUEST_LIMIT || '100kb',
  }),
)
app.use(express.json())

// health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    'health-check': 'OK: top level api working',
  })
})

// webhook
app.post('/webhook', SafetyController.handleWebhook)

// get integration config
app.get('/integration-config', (req: Request, res: Response) => {
  res.status(200).json(telexGeneratedConfig)
})

// Handle unknown endpoints
app.use('*', unknownEndpoint)

export default app
