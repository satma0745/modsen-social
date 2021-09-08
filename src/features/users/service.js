const { User } = require('../../models')
const { success, notFound, validationError, accessViolation } = require('../utils/service')

const getAllUsers = async () => {
  const users = await User.find({})
  return success(users)
}

const getSingleUser = async (userId) => {
  if (!(await User.existsWithId(userId))) {
    return notFound('User with provided id does not exist.')
  }

  const user = await User.findById(userId)
  return success(user)
}

const registerNewUser = async ({ username, password }) => {
  if (await User.existsWithUsername(username)) {
    return validationError({ username: 'Username already taken by someone else.' })
  }

  const user = new User({ username, password })
  await user.save()

  const userId = user._id.toString()
  return success(userId)
}

const updateUser = async ({ requesterId, userId, username, password }) => {
  if (!(await User.existsWithId(userId))) {
    return notFound('User with provided id does not exist.')
  }

  if (await User.existsWithUsername(username, userId)) {
    return validationError({ username: 'Username already taken by someone else.' })
  }

  if (!userId.equals(requesterId)) {
    return accessViolation()
  }

  await User.findByIdAndUpdate(userId, { username, password }, { runValidators: true })
  return success()
}

const deleteUser = async ({ requesterId, userId }) => {
  if (!(await User.existsWithId(userId))) {
    return notFound('User with provided id does not exist.')
  }

  if (!userId.equals(requesterId)) {
    return accessViolation()
  }

  await User.updateMany({}, { $pull: { 'profile.liked': userId, 'profile.likedBy': userId } })
  await User.findByIdAndDelete(userId)

  return success()
}

module.exports = { getAllUsers, getSingleUser, registerNewUser, updateUser, deleteUser }
