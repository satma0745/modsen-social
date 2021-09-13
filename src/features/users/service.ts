import { Types } from 'mongoose'

import { User, RefreshTokens } from '../../models'
import {
  success,
  notFound,
  validationError,
  accessViolation,
  ISuccessOperationResult,
  INotFoundOperationResult,
  IValidationErrorOperationResult,
  IAccessViolationOperationResult,
} from '../utils/service'

type GetAllUsers = () => Promise<ISuccessOperationResult>
const getAllUsers: GetAllUsers = async () => {
  const users = await User.find({})
  return success(users)
}

type GetSingleUser = (_userId: Types.ObjectId) => Promise<INotFoundOperationResult | ISuccessOperationResult>
const getSingleUser: GetSingleUser = async (userId) => {
  if (!(await User.existsWithId(userId))) {
    return notFound('User with provided id does not exist.')
  }

  const user = await User.findById(userId)
  return success(user)
}

type RegisterNewUser = (_credentials: {
  username: string
  password: string
}) => Promise<IValidationErrorOperationResult | ISuccessOperationResult>
const registerNewUser: RegisterNewUser = async ({ username, password }) => {
  if (await User.existsWithUsername(username)) {
    return validationError({ username: 'Username already taken by someone else.' })
  }

  const user = new User({ username, password })
  await user.save()

  const userId = user._id.toString()
  return success(userId)
}

type UpdateUser = (_options: {
  requesterId: Types.ObjectId
  userId: Types.ObjectId
  username: string
  password: string
}) => Promise<
  INotFoundOperationResult | IValidationErrorOperationResult | IAccessViolationOperationResult | ISuccessOperationResult
>
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

type DeleteUser = (_options: {
  requesterId: Types.ObjectId
  userId: Types.ObjectId
}) => Promise<INotFoundOperationResult | IAccessViolationOperationResult | ISuccessOperationResult>
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

export { getAllUsers, getSingleUser, registerNewUser, updateUser, deleteUser }
