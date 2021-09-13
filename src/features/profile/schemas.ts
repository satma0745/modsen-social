import { checkSchema, ParamSchema } from 'express-validator'
import { validObjectId, toObjectId, ofType } from '../utils/schema'

interface IShared {
  params: {
    userId: ParamSchema
  }
}
const shared: IShared = {
  params: {
    userId: {
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
}

const getUserProfileSchema = checkSchema({
  userId: shared.params.userId,
})

const getFansSchema = checkSchema({
  userId: shared.params.userId,
})

const getFavoritesSchema = checkSchema({
  userId: shared.params.userId,
})

const updateUserProfileSchema = checkSchema({
  userId: shared.params.userId,
  headline: {
    in: 'body',
    custom: {
      options: ofType(['undefined', 'string'], 'Headline must be of type string.'),
    },
    isLength: {
      options: { max: 100 },
      errorMessage: 'Profile headline cannot exceed 100 characters.',
    },
  },
  bio: {
    in: 'body',
    custom: {
      options: ofType(['undefined', 'string'], 'Bio must be of type string.'),
    },
    isLength: {
      options: { max: 4000 },
      errorMessage: 'Bio cannot exceed 4000 characters.',
    },
  },
  contacts: {
    in: 'body',
    custom: {
      options: (contacts) => {
        if (!contacts) {
          throw new Error('User contacts are required.')
        }
        if (!Array.isArray(contacts) || typeof contacts === 'string') {
          throw new Error('Contacts must be an array.')
        }

        contacts.forEach((contact) => {
          if (typeof contact !== 'object') {
            throw new Error('Each contact record must be an object.')
          }

          if (!contact.type) {
            throw new Error('Each contact record must contain type field.')
          }
          if (typeof contact.type !== 'string') {
            throw new Error('Contact record type must be of type string.')
          }
          if (contact.type.length > 20) {
            throw new Error('Contact record type cannot exceed 20 characters.')
          }

          if (!contact.type) {
            throw new Error('Each contact record must contain value field.')
          }
          if (typeof contact.value !== 'string') {
            throw new Error('Contact record value must be of type string.')
          }
          if (contact.value.length > 100) {
            throw new Error('Contact record value cannot exceed 100 characters.')
          }
        })

        return true
      },
    },
  },
})

const likeProfileSchema = checkSchema({
  userId: shared.params.userId,
})

const unlikeProfileSchema = checkSchema({
  userId: shared.params.userId,
})

export {
  getUserProfileSchema,
  getFansSchema,
  getFavoritesSchema,
  updateUserProfileSchema,
  likeProfileSchema,
  unlikeProfileSchema,
}
