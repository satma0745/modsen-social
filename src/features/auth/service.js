const { sign, verify } = require('jsonwebtoken')
const { ObjectId } = require('mongoose').Types

const { User, RefreshTokens } = require('../../models')
const { success, unauthorized, validationError } = require('../utils/service')

const refreshTokenPair = async (refreshToken) => {
  try {
    const tokenSecret = process.env.TOKEN_SECRET
    const accessTokenLifetime = process.env.ACCESS_TOKEN_LIFETIME
    const refreshTokenLifetime = process.env.REFRESH_TOKEN_LIFETIME

    const payload = verify(refreshToken, tokenSecret)
    const [userId, refreshTokenId] = payload.sub

    // check if refresh token is registered
    const userRefreshTokens = await RefreshTokens.findById(userId)
    if (userRefreshTokens === null) {
      return unauthorized({ refresh: true })
    }
    const userOwnsToken = userRefreshTokens.tokens.some((userTokenId) => userTokenId.equals(refreshTokenId))
    if (!userOwnsToken) {
      return unauthorized({ refresh: true })
    }

    // revoke refresh token
    const indexToRemove = userRefreshTokens.tokens.findIndex((userTokenId) => userTokenId.equals(refreshTokenId))
    userRefreshTokens.tokens.splice(indexToRemove, 1)

    // register new refresh token
    const newRefreshTokenId = new ObjectId()
    userRefreshTokens.tokens.push(newRefreshTokenId)

    await userRefreshTokens.save()

    // generate new token pair
    const tokens = {
      access: sign({ sub: userId }, tokenSecret, { expiresIn: accessTokenLifetime }),
      refresh: sign({ sub: [userId, newRefreshTokenId] }, tokenSecret, { expiresIn: refreshTokenLifetime }),
    }

    return success(tokens)
  } catch {
    return unauthorized({ refresh: true })
  }
}

const generateTokenPair = async ({ username, password }) => {
  if (!(await User.existsWithUsername(username))) {
    return validationError({ username: 'User with such username does not exist.' })
  }

  const user = await User.findByUsername(username)
  if (password !== user.password) {
    return validationError({ password: 'Incorrect password provided.' })
  }

  const refreshTokenId = new ObjectId()

  const userRefreshTokens = (await RefreshTokens.findById(user._id)) ?? new RefreshTokens({ _id: user._id })
  userRefreshTokens.tokens.push(refreshTokenId)
  await userRefreshTokens.save()

  const userId = user._id.toString()
  const tokenSecret = process.env.TOKEN_SECRET
  const accessTokenLifetime = process.env.ACCESS_TOKEN_LIFETIME
  const refreshTokenLifetime = process.env.REFRESH_TOKEN_LIFETIME

  const tokens = {
    access: sign({ sub: userId }, tokenSecret, { expiresIn: accessTokenLifetime }),
    refresh: sign({ sub: [userId, refreshTokenId.toString()] }, tokenSecret, { expiresIn: refreshTokenLifetime }),
  }

  return success(tokens)
}

const getUserInfo = async (userId) => {
  const user = await User.findById(userId)
  return success(user)
}

module.exports = { generateTokenPair, refreshTokenPair, getUserInfo }
