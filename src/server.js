const express = require('express')
const { configureEnvironment } = require('./environment')

configureEnvironment()

const app = express()

app.get('/', (_, res) => {
  res.sendStatus(200)
})

app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`)
})
