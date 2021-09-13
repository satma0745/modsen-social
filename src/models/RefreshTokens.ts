import { model, Schema, Types, SchemaTypes, Model, Document } from 'mongoose'

interface IUserRefreshTokenSchema extends Document {
  tokens: Types.ObjectId[]
  revokeTokens(): void
  revokeToken(_tokenId: Types.ObjectId): void
  addToken(): Types.ObjectId
  ownsToken(_tokenId: Types.ObjectId): boolean
}

interface IUserRefreshTokenModel extends Model<IUserRefreshTokenSchema> {
  findByUserId(_userId: Types.ObjectId): Promise<IUserRefreshTokenSchema>
  findByUserIdOrCreate(_userId: Types.ObjectId): Promise<IUserRefreshTokenSchema>
  findByUserIdAndDelete(_userId: Types.ObjectId): Promise<void>
}

const userRefreshTokensSchema = new Schema<IUserRefreshTokenSchema, IUserRefreshTokenModel>({
  tokens: [
    {
      type: SchemaTypes.ObjectId,
      required: true,
      default: [],
    },
  ],
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

export { RefreshTokens, IUserRefreshTokenSchema as IRefreshTokens }
