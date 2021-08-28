const express = require('express')
const responseTime = require('response-time')
const swaggerUi = require('swagger-ui-express')

const routes = require('./routes')

const configureApp = ({ swaggerSpec }) => {
  const app = express()

  // register common middlewares
  app.use(express.json())
  app.use(
    responseTime((req, res, time) => {
      const endpoint = `${req.method}: ${req.originalUrl}`
      const response = res.statusCode
      const elapsed = Math.round(time)

      console.log(`${endpoint} responded ${response} in ${elapsed}ms`)
    })
  )

  // configure routes
  app.use('/api/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
  app.use('/api/users', routes.user)

  // register error handlers
  app.use((_err, _req, res, _next) => {
    res.sendStatus(500)
  })

  return app
}

module.exports = configureApp
