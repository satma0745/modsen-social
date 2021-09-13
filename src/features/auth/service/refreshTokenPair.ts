import { verify } from 'jsonwebtoken'

import { RefreshTokens } from '../../../models'
import { ISuccessOperationResult, IUnauthorizedOperationResult, success, unauthorized } from '../../utils/service'

import { generateTokenPair } from '../tokens'

type RefreshTokenPair = (_refreshToken: string) => Promise<IUnauthorizedOperationResult | ISuccessOperationResult>

const refreshTokenPair: RefreshTokenPair = async (refreshToken) => {
  try {
    const tokenSecret = process.env.TOKEN_SECRET!
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

export default refreshTokenPair
