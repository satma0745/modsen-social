import { Types } from 'mongoose'

import { User } from '../../models'
import {
  success,
  notFound,
  accessViolation,
  conflict,
  INotFoundOperationResult,
  ISuccessOperationResult,
  IAccessViolationOperationResult,
  IConflictOperationResult,
} from '../utils/service'

type GetUserProfile = (_userId: Types.ObjectId) => Promise<INotFoundOperationResult | ISuccessOperationResult>
const getUserProfile: GetUserProfile = async (userId) => {
  const user = await User.findById(userId)
  if (user === null) {
    return notFound('User with provided id does not exist.')
  }

  return success(user.profile)
}

type GetFans = (_userId: Types.ObjectId) => Promise<INotFoundOperationResult | ISuccessOperationResult>
const getFans: GetFans = async (userId) => {
  const user = await User.findById(userId)
  if (user === null) {
    return notFound('User with provided id does not exist.')
  }

  const fans = await User.find({ _id: { $in: user.profile.likedBy } })
  return success(fans)
}

type GetFavorites = (_userId: Types.ObjectId) => Promise<INotFoundOperationResult | ISuccessOperationResult>
const getFavorites: GetFavorites = async (userId) => {
  const user = await User.findById(userId)
  if (user === null) {
    return notFound('User with provided id does not exist.')
  }

  const favorites = await User.find({ _id: { $in: user.profile.liked } })
  return success(favorites)
}

type UpdateUserProfile = (_options: {
  requesterId: Types.ObjectId
  userId: Types.ObjectId
  headline: string
  bio: string
  contacts: { type: string; value: string }[]
}) => Promise<INotFoundOperationResult | IAccessViolationOperationResult | ISuccessOperationResult>
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

type LikeProfile = (_options: {
  requesterId: Types.ObjectId
  profileOwnerId: string | Types.ObjectId
}) => Promise<INotFoundOperationResult | IConflictOperationResult | ISuccessOperationResult>
const likeProfile: LikeProfile = async ({ requesterId, profileOwnerId }) => {
  const profileOwner = await User.findById(profileOwnerId)
  if (profileOwner === null) {
    return notFound('User with provided id does not exist.')
  }

  const requester = await User.findById(requesterId)
  if (requester === null) {
    throw new Error('Requester does not exist.')
  }

  if (requester.profile.liked!.includes(profileOwner._id)) {
    return conflict('User profile is already liked by the requester.')
  }

  requester.profile.liked!.push(profileOwner._id)
  await requester.save()

  profileOwner.profile.likedBy!.push(requester._id)
  await profileOwner.save()

  return success()
}

type RemoveFromArray<T> = (_array: T[], _element: T) => void
const removeFromArray: RemoveFromArray<any> = (array, element) => {
  const indexToRemove = array.indexOf(element)
  if (indexToRemove >= 0) {
    array.splice(indexToRemove, 1)
  }
}

type UnlikeProfile = (_options: {
  requesterId: Types.ObjectId
  profileOwnerId: string | Types.ObjectId
}) => Promise<INotFoundOperationResult | IConflictOperationResult | ISuccessOperationResult>
const unlikeProfile: UnlikeProfile = async ({ requesterId, profileOwnerId }) => {
  const profileOwner = await User.findById(profileOwnerId)
  if (profileOwner === null) {
    return notFound('User with provided id does not exist.')
  }

  const requester = await User.findById(requesterId)
  if (requester === null) {
    throw new Error('Requester does not exist.')
  }

  if (!requester.profile.liked!.includes(profileOwner._id)) {
    return conflict('User profile was not previously liked by the requester.')
  }

  removeFromArray(requester.profile.liked!, profileOwner._id)
  await requester.save()

  removeFromArray(profileOwner.profile.likedBy!, requester._id)
  await profileOwner.save()

  return success()
}

export { getUserProfile, getFans, getFavorites, updateUserProfile, likeProfile, unlikeProfile }
