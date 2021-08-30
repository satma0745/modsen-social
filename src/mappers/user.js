const toCompactUserDto = (userModel) => {
  return {
    id: userModel._id.toString(),
    username: userModel.username,
    headline: userModel.profile.headline,
  }
}

const toRichUserDto = (userModel) => {
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

module.exports = { toCompactUserDto, toRichUserDto }
