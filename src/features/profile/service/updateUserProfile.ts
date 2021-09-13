import { Types } from 'mongoose'

import { User } from '../../../models'
import {
  accessViolation,
  IAccessViolationOperationResult,
  INotFoundOperationResult,
  ISuccessOperationResult,
  notFound,
  success,
} from '../../utils/service'

interface IUpdateOptions {
  requesterId: Types.ObjectId
  userId: Types.ObjectId
  headline: string
  bio: string
  contacts: { type: string; value: string }[]
}

type OperationResult = INotFoundOperationResult | IAccessViolationOperationResult | ISuccessOperationResult

type UpdateUserProfile = (_options: IUpdateOptions) => Promise<OperationResult>

const updateUserProfile: UpdateUserProfile = async ({ requesterId, userId, headline, bio, contacts }) => {
  const user = await User.findById(userId)
  if (user === null) {
    return notFound('User with provided id does not exist.')
  }

  if (!userId.equals(requesterId)) {
    return accessViolation()
  }

  user.profile = { headline, bio, contacts }
  await user.save()

  return success()
}

export default updateUserProfile
