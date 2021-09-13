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

type RemoveFromArray<T = any> = (_array: T[], _element: T) => void

const removeFromArray: RemoveFromArray = (array, element) => {
  const indexToRemove = array.indexOf(element)
  if (indexToRemove >= 0) {
    array.splice(indexToRemove, 1)
  }
}

interface IUnlikeOptions {
  requesterId: Types.ObjectId
  profileOwnerId: string | Types.ObjectId
}

type OperationResult = INotFoundOperationResult | IConflictOperationResult | ISuccessOperationResult

type UnlikeProfile = (_options: IUnlikeOptions) => Promise<OperationResult>

const unlikeProfile: UnlikeProfile = async ({ requesterId, profileOwnerId }) => {
  const profileOwner = await User.findById(profileOwnerId)
  if (profileOwner === null) {
    return notFound('User with provided id does not exist.')
  }

  const requester = (await User.findById(requesterId))!
  if (!requester.profile.liked!.includes(profileOwner._id)) {
    return conflict('User profile was not previously liked by the requester.')
  }

  removeFromArray(requester.profile.liked!, profileOwner._id)
  await requester.save()

  removeFromArray(profileOwner.profile.likedBy!, requester._id)
  await profileOwner.save()

  return success()
}

export default unlikeProfile
