import mongoose, { Connection } from 'mongoose'

type ConfigureDb = () => Promise<Connection>

const configureAsync: ConfigureDb = () => {
  return new Promise((resolve, reject) => {
    mongoose.connect(process.env.DB_CONNECTION).catch(console.error)
    const { connection } = mongoose

    connection.on('error', reject)

    connection.once('open', () => {
      resolve(connection)
    })
  })
}

export { configureAsync }
