import { NextFunction, Request, Response } from 'express'
import { validationResult } from 'express-validator'
import { ValidationChain } from 'express-validator/src/chain'
import { verify } from 'jsonwebtoken'

import { User } from '../../models'

type JwtAuth = (_req: Request, _res: Response, _next: NextFunction) => Promise<void>
const jwtAuth: JwtAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization.replace('Bearer', '').trim()
    const payload = verify(token, process.env.TOKEN_SECRET)

    const userId = payload.sub as string
    if (!(await User.existsWithId(userId))) {
      res.sendStatus(401)
      return
    }

    ;(req as any).user = {
      id: payload.sub,
    }

    next()
  } catch {
    res.sendStatus(401)
  }
}

type ValidationSchema = ValidationChain[] & {
  run: (_req: Request) => Promise<unknown[]>
}
type SchemaValidator = (_req: Request, _res: Response, _next: NextFunction) => Promise<void>
type ValidateWith = (_schema: ValidationSchema) => SchemaValidator
const validateWith: ValidateWith = (validationSchema) => async (req, res, next) => {
  try {
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
  } catch (err) {
    next(err)
  }
}

export { jwtAuth, validateWith }
