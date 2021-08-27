const { database, environment } = require('./config')
const app = require('./app')

environment.configure()
database.configure()

app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`)
})
