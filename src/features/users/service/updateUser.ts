import { Types } from 'mongoose'

import { RefreshTokens, User } from '../../../models'
import {
  accessViolation,
  IAccessViolationOperationResult,
  INotFoundOperationResult,
  ISuccessOperationResult,
  IValidationErrorOperationResult,
  notFound,
  success,
  validationError,
} from '../../utils/service'

interface IUpdateOptions {
  requesterId: Types.ObjectId
  userId: Types.ObjectId
  username: string
  password: string
}

type OperationResult =
  | INotFoundOperationResult
  | IValidationErrorOperationResult
  | IAccessViolationOperationResult
  | ISuccessOperationResult

type UpdateUser = (_options: IUpdateOptions) => Promise<OperationResult>

const updateUser: UpdateUser = async ({ requesterId, userId, username, password }) => {
  const user = await User.findById(userId)
  if (user === null) {
    return notFound('User with provided id does not exist.')
  }

  if (await User.existsWithUsername(username, userId)) {
    return validationError({ username: 'Username already taken by someone else.' })
  }

  if (!userId.equals(requesterId)) {
    return accessViolation()
  }

  // revoke refresh tokens if user credentials have changed
  if (username !== user.username || password !== user.password) {
    const userRefreshTokens = await RefreshTokens.findByUserId(user._id)
    userRefreshTokens?.revokeTokens()
    await userRefreshTokens?.save()
  }

  user.username = username
  user.password = password
  await user.save()

  return success()
}

export default updateUser
