import { Express } from 'express'
import { Connection } from 'mongoose'

import { database, environment, swagger } from './config'
import configureApp from './app'

type ConfiguredApplication = {
  app: Express
  db: Connection
}
type StartApplication = () => Promise<ConfiguredApplication>

const startAsync: StartApplication = async () => {
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

export default serverPromise
