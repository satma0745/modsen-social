const {
  Schema,
  SchemaTypes: { ObjectId },
} = require('mongoose')

const contactSchema = require('./contactSchema')

const refUsers = () => [
  {
    type: ObjectId,
    ref: 'User',
    required: true,
    default: [],
  },
]

const profileSchema = new Schema({
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
  likedBy: refUsers(),
  liked: refUsers(),
})

module.exports = profileSchema
