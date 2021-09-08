const { validationResult } = require('express-validator')
const { verify } = require('jsonwebtoken')
const { User } = require('../../models')

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

const validateWith = (validationSchema) => async (req, res, next) => {
  await validationSchema.run(req)
  const validationErrors = validationResult(req)

  if (!validationErrors.isEmpty()) {
    const response = {}
    validationErrors.array().forEach(({ msg, param }) => {
      if (!(param in response)) {
        response[param] = msg
      }
    })

    res.status(400).json(response)
  } else {
    next()
  }
}

module.exports = { jwtAuth, validateWith }
