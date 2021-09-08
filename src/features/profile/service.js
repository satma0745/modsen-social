const { User } = require('../../models')
const { success, notFound, accessViolation, conflict } = require('../utils/service')

const getUserProfile = async (userId) => {
  if (!(await User.existsWithId(userId))) {
    return notFound('User with provided id does not exist.')
  }

  const user = await User.findOne({ _id: userId })
  return success(user.profile)
}

const getFans = async (userId) => {
  if (!(await User.existsWithId(userId))) {
    return notFound('User with provided id does not exist.')
  }

  const user = await User.findById(userId)
  const fans = await User.find({ _id: { $in: user.profile.likedBy } })

  return success(fans)
}

const getFavorites = async (userId) => {
  if (!(await User.existsWithId(userId))) {
    return notFound('User with provided id does not exist.')
  }

  const user = await User.findById(userId)
  const favorites = await User.find({ _id: { $in: user.profile.liked } })

  return success(favorites)
}

const updateUserProfile = async ({ requesterId, userId, headline, bio, contacts }) => {
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

const likeProfile = async ({ requesterId, profileOwnerId }) => {
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

const remove = (array, element) => {
  const indexToRemove = array.indexOf(element)
  if (indexToRemove >= 0) {
    array.splice(indexToRemove, 1)
  }
}
const unlikeProfile = async ({ requesterId, profileOwnerId }) => {
  if (!(await User.existsWithId(profileOwnerId))) {
    return notFound('User with provided id does not exist.')
  }

  const requester = await User.findById(requesterId)
  const target = await User.findById(profileOwnerId)

  if (!requester.profile.liked.includes(target._id)) {
    return conflict('User profile was not previously liked by the requester.')
  }

  remove(requester.profile.liked, target._id)
  await requester.save()

  remove(target.profile.likedBy, requester._id)
  await target.save()

  return success()
}

module.exports = { getUserProfile, getFans, getFavorites, updateUserProfile, likeProfile, unlikeProfile }
