const express = require('express')
const responseTime = require('response-time')
const routes = require('./routes')

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
app.use('/api/users', routes.user)

// register error handlers
app.use((_err, _req, res, _next) => {
  res.sendStatus(500)
})

module.exports = app
