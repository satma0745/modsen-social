import { Types } from 'mongoose'

import { RefreshTokens, User } from '../../../models'
import {
  accessViolation,
  IAccessViolationOperationResult,
  INotFoundOperationResult,
  ISuccessOperationResult,
  notFound,
  success,
} from '../../utils/service'

interface IDeleteOptions {
  requesterId: Types.ObjectId
  userId: Types.ObjectId
}

type OperationResult = INotFoundOperationResult | IAccessViolationOperationResult | ISuccessOperationResult

type DeleteUser = (_options: IDeleteOptions) => Promise<OperationResult>

const deleteUser: DeleteUser = async ({ requesterId, userId }) => {
  if (!(await User.existsWithId(userId))) {
    return notFound('User with provided id does not exist.')
  }

  if (!userId.equals(requesterId)) {
    return accessViolation()
  }

  await User.updateMany({}, { $pull: { 'profile.liked': userId, 'profile.likedBy': userId } })
  await RefreshTokens.findByUserIdAndDelete(userId)
  await User.findByIdAndDelete(userId)

  return success()
}

export default deleteUser
