import { verify } from 'jsonwebtoken'
import { Types } from 'mongoose'

import { User, RefreshTokens } from '../../models'
import {
  ISuccessOperationResult,
  IUnauthorizedOperationResult,
  IValidationErrorOperationResult,
  success,
  unauthorized,
  validationError,
} from '../utils/service'

import { generateTokenPair } from './tokens'

type RefreshTokenPair = (_refreshToken: string) => Promise<IUnauthorizedOperationResult | ISuccessOperationResult>
const refreshTokenPair: RefreshTokenPair = async (refreshToken) => {
  try {
    const tokenSecret = process.env.TOKEN_SECRET
    const payload = verify(refreshToken, tokenSecret)

    if (!Array.isArray(payload.sub)) {
      return unauthorized({ refresh: true })
    }
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

interface ICredentials {
  username: string
  password: string
}
type IssueTokenPair = (_credentials: ICredentials) => Promise<IValidationErrorOperationResult | ISuccessOperationResult>
const issueTokenPair: IssueTokenPair = async ({ username, password }) => {
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

type GetUserInfo = (_userId: Types.ObjectId) => Promise<ISuccessOperationResult>
const getUserInfo: GetUserInfo = async (userId) => {
  const user = await User.findById(userId)
  return success(user)
}

export { issueTokenPair, refreshTokenPair, getUserInfo }
