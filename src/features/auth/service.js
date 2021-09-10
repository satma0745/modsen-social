const { verify } = require('jsonwebtoken')
const { ObjectId } = require('mongoose').Types

const { User, RefreshTokens } = require('../../models')
const { success, unauthorized, validationError } = require('../utils/service')
const { generateTokenPair } = require('./token')

const refreshTokenPair = async (refreshToken) => {
  try {
    const tokenSecret = process.env.TOKEN_SECRET
    const payload = verify(refreshToken, tokenSecret)
    const [userId, refreshTokenId] = payload.sub

    // check if refresh token is registered
    const userRefreshTokens = await RefreshTokens.findByUserId(userId)
    if (userRefreshTokens === null) {
      return unauthorized({ refresh: true })
    }
    const userOwnsToken = userRefreshTokens.tokens.some((userTokenId) => userTokenId.equals(refreshTokenId))
    if (!userOwnsToken) {
      return unauthorized({ refresh: true })
    }

    // revoke old refresh token & register the new one
    const indexToRemove = userRefreshTokens.tokens.findIndex((userTokenId) => userTokenId.equals(refreshTokenId))
    userRefreshTokens.tokens.splice(indexToRemove, 1)
    const newRefreshTokenId = new ObjectId()
    userRefreshTokens.tokens.push(newRefreshTokenId)
    await userRefreshTokens.save()

    const tokens = generateTokenPair({ userId, refreshTokenId: newRefreshTokenId.toString() })
    return success(tokens)
  } catch {
    return unauthorized({ refresh: true })
  }
}

const issueTokenPair = async ({ username, password }) => {
  if (!(await User.existsWithUsername(username))) {
    return validationError({ username: 'User with such username does not exist.' })
  }

  const user = await User.findByUsername(username)
  if (password !== user.password) {
    return validationError({ password: 'Incorrect password provided.' })
  }

  const refreshTokenId = new ObjectId()

  // register issued refresh token
  const userRefreshTokens = await RefreshTokens.findByUserIdOrCreate(user._id)
  userRefreshTokens.tokens.push(refreshTokenId)
  await userRefreshTokens.save()

  const tokens = generateTokenPair({ userId: user._id.toString(), refreshTokenId: refreshTokenId.toString() })
  return success(tokens)
}

const getUserInfo = async (userId) => {
  const user = await User.findById(userId)
  return success(user)
}

module.exports = { issueTokenPair, refreshTokenPair, getUserInfo }
