const mongoose = require('mongoose')

const configureAsync = () => {
  return new Promise((resolve, reject) => {
    mongoose.connect(process.env.DB_CONNECTION).catch(console.error)
    const { connection } = mongoose

    connection.on('error', reject)

    connection.once('open', () => {
      resolve(connection)
    })
  })
}

module.exports = { configureAsync }
