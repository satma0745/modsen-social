const path = require('path')
const dotenv = require('dotenv')

const configure = () => {
  const environment = process.env.MODSEN_SOCIAL_ENV
  const pathToFile = path.resolve(__dirname, `../../environment/.env.${environment}`)

  dotenv.config({ path: pathToFile })
}

module.exports = {
  configure,
}
