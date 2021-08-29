const {
  isValidObjectId,
  Types: { ObjectId },
} = require('mongoose')
const { validationResult } = require('express-validator')
const { verify } = require('jsonwebtoken')

const { User } = require('../schemas')

const jwtAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization.replace('Bearer', '').trim()
    const payload = verify(token, process.env.TOKEN_SECRET)

    if (!(await User.existsWithId(payload.sub))) {
      res.sendStatus(401)
      return
    }

    req.user = {
      id: payload.sub,
    }

    next()
  } catch {
    res.sendStatus(401)
  }
}

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

module.exports = { validObjectId, toObjectId, jwtAuth, handleAsync }
