import mongoose, { Connection } from 'mongoose'

type ConfigureDb = () => Promise<Connection>

const configureAsync: ConfigureDb = () => {
  return new Promise((resolve, reject) => {
    const connectionString = process.env.DB_CONNECTION!
    mongoose.connect(connectionString).catch(console.error)
    const { connection } = mongoose

    connection.on('error', reject)

    connection.once('open', () => {
      resolve(connection)
    })
  })
}

export { configureAsync }
