const { checkSchema } = require('express-validator')
const { validObjectId, toObjectId } = require('../utils/schema')

const getSingleUserSchema = checkSchema({
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
})

const registerNewUserSchema = checkSchema({
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
})

const updateUserSchema = checkSchema({
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
})

const deleteUserSchema = checkSchema({
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
})

module.exports = { getSingleUserSchema, registerNewUserSchema, updateUserSchema, deleteUserSchema }
