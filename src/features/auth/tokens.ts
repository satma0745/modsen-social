import { sign } from 'jsonwebtoken'
import { Types } from 'mongoose'

type Options = {
  userId: string | Types.ObjectId
  refreshTokenId: string | Types.ObjectId
}

type TokenPair = {
  access: string
  refresh: string
}

type GenerateTokenPair = (options: Options) => TokenPair

const generateTokenPair: GenerateTokenPair = (options) => {
  const tokenSecret = process.env.TOKEN_SECRET
  const accessTokenLifetime = process.env.ACCESS_TOKEN_LIFETIME
  const refreshTokenLifetime = process.env.REFRESH_TOKEN_LIFETIME

  const userId = options.userId.toString()
  const refreshTokenId = options.refreshTokenId.toString()

  const accessToken = sign({ sub: userId }, tokenSecret, { expiresIn: accessTokenLifetime })
  const refreshToken = sign({ sub: [userId, refreshTokenId] }, tokenSecret, { expiresIn: refreshTokenLifetime })

  return { access: accessToken, refresh: refreshToken }
}

export { generateTokenPair }
