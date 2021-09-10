const { model, Schema, Types, SchemaTypes } = require('mongoose')

const userRefreshTokensSchema = new Schema({
  tokens: {
    type: [SchemaTypes.ObjectId],
    required: true,
    default: [],
  },
})

userRefreshTokensSchema.statics.findByUserId = function findByUserId(userId) {
  return this.findById(userId)
}

userRefreshTokensSchema.statics.findByUserIdOrCreate = async function findByUserIdOrCreate(userId) {
  const userRefreshTokens = await this.findByUserId(userId)
  return userRefreshTokens === null ? new this({ _id: userId }) : userRefreshTokens
}

userRefreshTokensSchema.statics.findByUserIdAndDelete = function findByUserIdAndDelete(userId) {
  return this.findOneAndDelete({ _id: userId })
}

userRefreshTokensSchema.methods.revokeTokens = function revokeTokens() {
  this.tokens = []
}

userRefreshTokensSchema.methods.revokeToken = function revokeToken(tokenIdToRemove) {
  const indexToRemove = this.tokens.findIndex((tokenId) => tokenId.equals(tokenIdToRemove))
  this.tokens.splice(indexToRemove, 1)
}

userRefreshTokensSchema.methods.addToken = function addToken() {
  const tokenId = new Types.ObjectId()
  this.tokens.push(tokenId)
  return tokenId
}

userRefreshTokensSchema.methods.ownsToken = function ownsToken(tokenId) {
  return this.tokens.some((ownedTokenId) => ownedTokenId.equals(tokenId))
}

const RefreshTokens = model('RefreshTokens', userRefreshTokensSchema)

module.exports = RefreshTokens
