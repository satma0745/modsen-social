const {
  isValidObjectId,
  Types: { ObjectId },
} = require('mongoose')

const validObjectId = (errorMessage) => {
  return (value) => {
    if (!isValidObjectId(value)) {
      throw new Error(errorMessage)
    }

    return true
  }
}

const toObjectId = (value) => {
  return isValidObjectId(value) ? new ObjectId(value) : null
}

const ofType = (allowedTypes, errorMessage) => {
  return (value) => {
    // eslint-disable-next-line no-restricted-syntax
    for (const allowedType of allowedTypes) {
      // eslint-disable-next-line valid-typeof
      if (typeof value === allowedType) {
        return true
      }
    }

    throw new Error(errorMessage)
  }
}

module.exports = { validObjectId, toObjectId, ofType }
