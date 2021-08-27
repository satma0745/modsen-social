const path = require('path')
const dotenv = require('dotenv')

const configureEnvironment = () => {
  const environment = process.env.NODE_ENV
  const pathToFile = path.resolve(__dirname, `../environment/.env.${environment}`)

  dotenv.config({ path: pathToFile })
}

module.exports = {
  configureEnvironment,
}
