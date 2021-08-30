const toUserDto = (userModel) => {
  return {
    id: userModel._id.toString(),
    username: userModel.username,
    headline: userModel.profile.headline,
    likes: userModel.profile.likedBy.length,
  }
}

const toUserDtos = (userModelCollection) => {
  return userModelCollection.map(toUserDto)
}

module.exports = { toUserDto, toUserDtos }
