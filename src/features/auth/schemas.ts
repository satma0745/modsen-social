import { checkSchema } from 'express-validator'

const issueTokenPairSchema = checkSchema({
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

export { issueTokenPairSchema, refreshTokenPairSchema }
