const { checkSchema } = require('express-validator')

const generateTokenSchema = checkSchema({
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

module.exports = { generateTokenSchema }
