import path from 'path'
import dotenv from 'dotenv'

const configure = () => {
  const environment = process.env.MODSEN_SOCIAL_ENV
  const pathToFile = path.resolve(__dirname, `../../environment/.env.${environment}`)

  dotenv.config({ path: pathToFile })
}

export { configure }
