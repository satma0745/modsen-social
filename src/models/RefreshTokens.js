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

const RefreshTokens = model('RefreshTokens', userRefreshTokensSchema)

module.exports = RefreshTokens
