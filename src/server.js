const express = require('express')

const { database, environment } = require('./config')
const routes = require('./routes')

environment.configure()
database.configure()

const app = express()
app.use(express.json())
app.use('/api/users', routes.user)

app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`)
})
