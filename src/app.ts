import express, { Express, Request } from 'express'
import responseTime from 'response-time'
import swaggerUi, { JsonObject } from 'swagger-ui-express'

import * as features from './features'

type Port = number | string
type LaunchApp = (_port: Port) => Promise<Express>

interface AppConfig {
  swaggerSpec: JsonObject
}
type ConfigureApp = (_config: AppConfig) => LaunchApp

const configureApp: ConfigureApp = ({ swaggerSpec }) => {
  const app = express()

  // register common middlewares
  app.use(express.json())
  if (process.env.MODSEN_SOCIAL_ENV === 'development') {
    app.use(
      responseTime((req: Request, res, time) => {
        const endpoint = `${req.method}: ${req.originalUrl}`
        const response = res.statusCode
        const elapsed = Math.round(time)

        console.log(`${endpoint} responded ${response} in ${elapsed}ms`)
      })
    )
  }

  // configure routes
  app.use('/api/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
  app.use('/api/auth', features.auth)
  app.use('/api/users/:userId/profile', features.profile)
  app.use('/api/users', features.users)

  // register error handlers
  app.use((_err, _req, res, _next) => {
    res.sendStatus(500)
  })

  const launchAsync: LaunchApp = (port) => {
    return new Promise((resolve) => {
      app.listen(port, () => {
        resolve(app)
      })
    })
  }

  return launchAsync
}

export default configureApp
