const { sign } = require('jsonwebtoken')

const { User } = require('../../models')
const { success, validationError } = require('../utils/service')

const generateToken = async ({ username, password }) => {
  if (!(await User.existsWithUsername(username))) {
    return validationError({ username: 'User with such username does not exist.' })
  }

  const user = await User.findByUsername(username)
  if (password !== user.password) {
    return validationError({ password: 'Incorrect password provided.' })
  }

  const token = sign({ sub: user.id }, process.env.TOKEN_SECRET, { expiresIn: '30 days' })
  return success(token)
}

const getUserInfo = async (userId) => {
  const user = await User.findById(userId)
  return success(user)
}

module.exports = { generateToken, getUserInfo }
