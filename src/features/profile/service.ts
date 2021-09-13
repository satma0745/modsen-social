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

type GetUserProfile = (userId: Types.ObjectId) => Promise<INotFoundOperationResult | ISuccessOperationResult>
const getUserProfile: GetUserProfile = async (userId) => {
  if (!(await User.existsWithId(userId))) {
    return notFound('User with provided id does not exist.')
  }

  const user = await User.findOne({ _id: userId })
  return success(user.profile)
}

type GetFans = (userId: Types.ObjectId) => Promise<INotFoundOperationResult | ISuccessOperationResult>
const getFans: GetFans = async (userId) => {
  if (!(await User.existsWithId(userId))) {
    return notFound('User with provided id does not exist.')
  }

  const user = await User.findById(userId)
  const fans = await User.find({ _id: { $in: user.profile.likedBy } })

  return success(fans)
}

type GetFavorites = (userId: Types.ObjectId) => Promise<INotFoundOperationResult | ISuccessOperationResult>
const getFavorites: GetFavorites = async (userId) => {
  if (!(await User.existsWithId(userId))) {
    return notFound('User with provided id does not exist.')
  }

  const user = await User.findById(userId)
  const favorites = await User.find({ _id: { $in: user.profile.liked } })

  return success(favorites)
}

type UpdateUserProfile = (options: {
  requesterId: Types.ObjectId
  userId: Types.ObjectId
  headline: string
  bio: string
  contacts: { type: string; value: string }[]
}) => Promise<INotFoundOperationResult | IAccessViolationOperationResult | ISuccessOperationResult>
const updateUserProfile: UpdateUserProfile = async ({ requesterId, userId, headline, bio, contacts }) => {
  if (!(await User.existsWithId(userId))) {
    return notFound('User with provided id does not exist.')
  }

  if (!userId.equals(requesterId)) {
    return accessViolation()
  }

  const user = await User.findById(userId)
  user.profile = { headline, bio, contacts }
  await user.save()

  return success()
}

type LikeProfile = (options: {
  requesterId: Types.ObjectId
  profileOwnerId: string | Types.ObjectId
}) => Promise<INotFoundOperationResult | IConflictOperationResult | ISuccessOperationResult>
const likeProfile: LikeProfile = async ({ requesterId, profileOwnerId }) => {
  if (!(await User.existsWithId(profileOwnerId))) {
    return notFound('User with provided id does not exist.')
  }

  const requester = await User.findById(requesterId)
  const target = await User.findById(profileOwnerId)

  if (requester.profile.liked.includes(target._id)) {
    return conflict('User profile is already liked by the requester.')
  }

  requester.profile.liked.push(target._id)
  await requester.save()

  target.profile.likedBy.push(requester._id)
  await target.save()

  return success()
}

type RemoveFromArray<T> = (array: T[], element: T) => void
const removeFromArray: RemoveFromArray<any> = (array, element) => {
  const indexToRemove = array.indexOf(element)
  if (indexToRemove >= 0) {
    array.splice(indexToRemove, 1)
  }
}

type UnlikeProfile = (options: {
  requesterId: Types.ObjectId
  profileOwnerId: string | Types.ObjectId
}) => Promise<INotFoundOperationResult | IConflictOperationResult | ISuccessOperationResult>
const unlikeProfile: UnlikeProfile = async ({ requesterId, profileOwnerId }) => {
  if (!(await User.existsWithId(profileOwnerId))) {
    return notFound('User with provided id does not exist.')
  }

  const requester = await User.findById(requesterId)
  const target = await User.findById(profileOwnerId)

  if (!requester.profile.liked.includes(target._id)) {
    return conflict('User profile was not previously liked by the requester.')
  }

  removeFromArray(requester.profile.liked, target._id)
  await requester.save()

  removeFromArray(target.profile.likedBy, requester._id)
  await target.save()

  return success()
}

export { getUserProfile, getFans, getFavorites, updateUserProfile, likeProfile, unlikeProfile }
