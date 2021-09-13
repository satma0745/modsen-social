import { ValidationChain } from 'express-validator/src/chain'
import { NextFunction, Request, Response } from 'express'
import { validationResult } from 'express-validator'

interface ValidationErrors {
  [_key: string]: string
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
      const response: ValidationErrors = {}
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

export default validateWith
