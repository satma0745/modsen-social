const toUserDto = (userModel) => {
  const contacts = userModel.profile.contacts.map((contact) => {
    return {
      type: contact.type,
      value: contact.value,
    }
  })

  const profile = {
    headline: userModel.profile.headline,
    bio: userModel.profile.bio,
    contacts,
  }

  return {
    id: userModel._id.toString(),
    username: userModel.username,
    profile,
  }
}

const toUserDtos = (userModels) => {
  return userModels.map(toUserDto)
}

module.exports = { toUserDto, toUserDtos }
