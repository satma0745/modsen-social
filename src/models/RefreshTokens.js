const {
  model,
  Schema,
  SchemaTypes: { ObjectId },
} = require('mongoose')

const userRefreshTokensSchema = new Schema({
  tokens: {
    type: [ObjectId],
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

userRefreshTokensSchema.statics.revokeUserTokens = async function revokeUserTokens(userId) {
  const userRefreshTokens = await this.findByUserId(userId)

  if (userRefreshTokens !== null) {
    userRefreshTokens.tokens = []
    await userRefreshTokens.save()
  }
}

const RefreshTokens = model('RefreshTokens', userRefreshTokensSchema)

module.exports = RefreshTokens
