const { verify } = require('jsonwebtoken')

const { User, RefreshTokens } = require('../../models')
const { success, unauthorized, validationError } = require('../utils/service')
const { generateTokenPair } = require('./token')

const refreshTokenPair = async (refreshToken) => {
  try {
    const tokenSecret = process.env.TOKEN_SECRET
    const payload = verify(refreshToken, tokenSecret)
    const [userId, refreshTokenId] = payload.sub

    const userRefreshTokens = await RefreshTokens.findByUserId(userId)
    if (userRefreshTokens === null || !userRefreshTokens.ownsToken(refreshTokenId)) {
      return unauthorized({ refresh: true })
    }

    userRefreshTokens.revokeToken(refreshTokenId)
    const newRefreshTokenId = userRefreshTokens.addToken()
    await userRefreshTokens.save()

    const tokens = generateTokenPair({ userId, refreshTokenId: newRefreshTokenId.toString() })
    return success(tokens)
  } catch {
    return unauthorized({ refresh: true })
  }
}

const issueTokenPair = async ({ username, password }) => {
  const user = await User.findByUsername(username)
  if (user === null) {
    return validationError({ username: 'User with such username does not exist.' })
  }
  if (password !== user.password) {
    return validationError({ password: 'Incorrect password provided.' })
  }

  const userRefreshTokens = await RefreshTokens.findByUserIdOrCreate(user._id)
  const refreshTokenId = userRefreshTokens.addToken()
  await userRefreshTokens.save()

  const tokens = generateTokenPair({ userId: user._id.toString(), refreshTokenId: refreshTokenId.toString() })
  return success(tokens)
}

const getUserInfo = async (userId) => {
  const user = await User.findById(userId)
  return success(user)
}

module.exports = { issueTokenPair, refreshTokenPair, getUserInfo }
