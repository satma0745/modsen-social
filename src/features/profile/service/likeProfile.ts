import { Types } from 'mongoose'

import { User } from '../../../models'
import {
  conflict,
  IConflictOperationResult,
  INotFoundOperationResult,
  ISuccessOperationResult,
  notFound,
  success,
} from '../../utils/service'

interface ILikeOptions {
  requesterId: Types.ObjectId
  profileOwnerId: string | Types.ObjectId
}

type OperationResult = INotFoundOperationResult | IConflictOperationResult | ISuccessOperationResult

type LikeProfile = (_options: ILikeOptions) => Promise<OperationResult>

const likeProfile: LikeProfile = async ({ requesterId, profileOwnerId }) => {
  const profileOwner = await User.findById(profileOwnerId)
  if (profileOwner === null) {
    return notFound('User with provided id does not exist.')
  }

  const requester = (await User.findById(requesterId))!
  if (requester.profile.liked!.includes(profileOwner._id)) {
    return conflict('User profile is already liked by the requester.')
  }

  requester.profile.liked!.push(profileOwner._id)
  await requester.save()

  profileOwner.profile.likedBy!.push(requester._id)
  await profileOwner.save()

  return success()
}

export default likeProfile
