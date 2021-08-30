const toProfileDto = (userModel) => ({
  headline: userModel.profile.headline,
  bio: userModel.profile.bio,
  likes: userModel.profile.likedBy.length,
  contacts: userModel.profile.contacts.map(({ type, value }) => ({ type, value })),
})

module.exports = { toProfileDto }
