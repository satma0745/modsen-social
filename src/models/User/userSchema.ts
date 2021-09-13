import { Schema, Model, Types, Document } from 'mongoose'
import { profileSchema, IProfileSchema } from './profileSchema'

interface IUserSchema extends Document {
  username: string
  password: string
  profile: IProfileSchema
}

interface IUserModel extends Model<IUserSchema> {
  existsWithId(_id: string | Types.ObjectId): Promise<boolean>
  existsWithUsername(_username: string, _exceptionId?: string | Types.ObjectId): Promise<boolean>
  findByUsername(_username: string): Promise<IUserSchema>
}

const userSchema = new Schema<IUserSchema, IUserModel>({
  username: {
    type: String,
    required: true,
    minLength: 6,
    maxLength: 20,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minLength: 6,
    maxLength: 20,
    trim: true,
  },
  profile: {
    type: profileSchema,
    required: true,
    default: {
      contacts: [],
      likedBy: [],
      liked: [],
    },
  },
})

userSchema.statics.existsWithId = async function existsWithId(id) {
  const count = await this.countDocuments({ _id: id })
  return count > 0
}

userSchema.statics.existsWithUsername = async function existsWithUsername(username, exceptionId) {
  const count = await this.countDocuments({ username, _id: { $ne: exceptionId } })
  return count > 0
}

userSchema.statics.findByUsername = function findByUsername(username) {
  return this.findOne({ username })
}

export { userSchema, IUserSchema, IUserModel }
