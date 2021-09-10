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

const RefreshTokens = model('RefreshTokens', userRefreshTokensSchema)

module.exports = RefreshTokens
