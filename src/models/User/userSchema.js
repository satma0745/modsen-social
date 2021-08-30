const { Schema } = require('mongoose')
const profileSchema = require('./profileSchema')

const userSchema = new Schema({
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

module.exports = userSchema
