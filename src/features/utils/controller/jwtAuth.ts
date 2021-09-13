import { NextFunction, Request, Response } from 'express'
import { verify } from 'jsonwebtoken'

import { User } from '../../../models'

type JwtAuth = (_req: Request, _res: Response, _next: NextFunction) => Promise<void>

const jwtAuth: JwtAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization!.replace('Bearer', '').trim()
    const payload = verify(token, process.env.TOKEN_SECRET!)

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

export default jwtAuth
