const {
  isValidObjectId,
  Types: { ObjectId },
} = require('mongoose')
const { validationResult } = require('express-validator')

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

const validationErrorResponse = (errors) => {
  const response = {}

  errors.forEach(({ msg, param }) => {
    if (!(param in response)) {
      response[param] = msg
    }
  })

  return response
}

const handleAsync = (requestHandler) => (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const response = validationErrorResponse(errors.array())
    res.status(400).send(response)
    return
  }

  requestHandler(req, res).catch(next)
}

module.exports = { validObjectId, toObjectId, handleAsync }
