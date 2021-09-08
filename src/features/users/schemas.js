const { checkSchema } = require('express-validator')
const { validObjectId, toObjectId } = require('../utils/schema')

const shared = {
  params: {
    id: {
      in: 'params',
      notEmpty: true,
      errorMessage: 'User id is required.',
      custom: {
        options: validObjectId('Invalid user id.'),
      },
      customSanitizer: {
        options: toObjectId,
      },
    },
  },
  body: {
    username: {
      in: 'body',
      notEmpty: true,
      errorMessage: 'Username is required.',
      isString: {
        options: true,
        errorMessage: 'Username must be of type string.',
      },
      isLength: {
        options: { min: 6, max: 20 },
        errorMessage: 'Username must be at least 6 and at most 20 characters long.',
      },
    },
    password: {
      in: 'body',
      notEmpty: true,
      errorMessage: 'Password is required.',
      isString: {
        options: true,
        errorMessage: 'Password must be of type string.',
      },
      isLength: {
        options: { min: 6, max: 20 },
        errorMessage: 'Password must be at least 6 and at most 20 characters long.',
      },
    },
  },
}

const getSingleUserSchema = checkSchema({
  id: shared.params.id,
})

const registerNewUserSchema = checkSchema({
  username: shared.body.username,
  password: shared.body.password,
})

const updateUserSchema = checkSchema({
  id: shared.params.id,
  username: shared.body.username,
  password: shared.body.password,
})

const deleteUserSchema = checkSchema({
  id: shared.params.id,
})

module.exports = { getSingleUserSchema, registerNewUserSchema, updateUserSchema, deleteUserSchema }
