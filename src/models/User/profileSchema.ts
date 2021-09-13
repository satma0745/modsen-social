import { Schema, SchemaTypes, Types } from 'mongoose'
import { contactSchema, IContactSchema } from './contactSchema'

interface IProfileSchema {
  headline?: string
  bio?: string
  contacts: IContactSchema[]
  likedBy?: Types.ObjectId[]
  liked?: Types.ObjectId[]
}

const profileSchema = new Schema<IProfileSchema>({
  headline: {
    type: String,
    maxLength: 100,
    trim: true,
  },
  bio: {
    type: String,
    maxLength: 4000,
    trim: true,
  },
  contacts: {
    type: [contactSchema],
    required: true,
    default: [],
  },
  likedBy: [
    {
      type: SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
      default: [],
    },
  ],
  liked: [
    {
      type: SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
      default: [],
    },
  ],
})

export { profileSchema, IProfileSchema }
