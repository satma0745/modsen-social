const mongoose = require('mongoose')

const configure = () => {
  mongoose.connect(process.env.DB_CONNECTION).catch(console.error)

  const db = mongoose.connection
  db.on('error', console.error.bind(console, 'DB Connection failed: '))
  db.once('open', () => {
    console.log('Connected successfully')
  })

  return mongoose.connection
}

module.exports = {
  configure,
}
