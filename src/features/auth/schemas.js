const { checkSchema } = require('express-validator')

const generateTokenPairSchema = checkSchema({
  username: {
    in: 'body',
    notEmpty: true,
    errorMessage: 'Username is required.',
  },
  password: {
    in: 'body',
    notEmpty: true,
    errorMessage: 'Password is required.',
  },
})

const refreshTokenPairSchema = checkSchema({
  refresh: {
    in: 'body',
    notEmpty: true,
    errorMessage: 'Refresh token is required.',
  },
})

module.exports = { generateTokenPairSchema, refreshTokenPairSchema }
