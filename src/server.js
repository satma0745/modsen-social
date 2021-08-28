const { database, environment, swagger } = require('./config')
const configureApp = require('./app')

environment.configure()
database.configure()
const swaggerSpec = swagger.createSpec()

const app = configureApp({ swaggerSpec })
app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`)
})
