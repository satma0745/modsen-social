import { ISuccessOperationResult, IValidationErrorOperationResult, success, validationError } from '../../utils/service'
import { RefreshTokens, User } from '../../../models'

import { generateTokenPair } from '../tokens'

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

export default issueTokenPair
