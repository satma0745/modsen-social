const { model, Schema } = require('mongoose')

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
})

userSchema.statics.existsWithId = async function existsWithId(id) {
  const count = await this.countDocuments({ _id: id })
  return count > 0
}

const User = model('User', userSchema)

module.exports = User
