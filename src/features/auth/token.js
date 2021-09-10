const { sign } = require('jsonwebtoken')

const generateTokenPair = ({ userId, refreshTokenId }) => {
  const tokenSecret = process.env.TOKEN_SECRET
  const accessTokenLifetime = process.env.ACCESS_TOKEN_LIFETIME
  const refreshTokenLifetime = process.env.REFRESH_TOKEN_LIFETIME

  const accessToken = sign({ sub: userId }, tokenSecret, { expiresIn: accessTokenLifetime })
  const refreshToken = sign({ sub: [userId, refreshTokenId] }, tokenSecret, { expiresIn: refreshTokenLifetime })

  return { access: accessToken, refresh: refreshToken }
}

module.exports = { generateTokenPair }
