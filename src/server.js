const { database, environment, swagger } = require('./config')
const configureApp = require('./app')

const startAsync = async () => {
  environment.configure()
  const swaggerSpec = swagger.createSpec()
  const db = await database.configureAsync()
  console.log('Connected to DB')

  const launchAppAsync = configureApp({ swaggerSpec })
  const app = await launchAppAsync(process.env.PORT)
  console.log(`Listening on port ${process.env.PORT}`)

  return { app, db }
}

const serverPromise = startAsync()

module.exports = serverPromise
