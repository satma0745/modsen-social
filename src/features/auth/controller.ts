import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import { match } from 'ts-pattern'
import { Types } from 'mongoose'

import { jwtAuth, validateWith } from '../utils/controller'

import { toUserDto } from './dtos'
import { issueTokenPairSchema, refreshTokenPairSchema } from './schemas'
import { issueTokenPair, refreshTokenPair, getUserInfo } from './service'

const router = Router()

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user info.
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User info retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                   example: qwerty
 *                 password:
 *                   type: string
 *                   example: password
 *                 headline:
 *                   type: string
 *                   example: Hello, my name is Qwerty.
 *                 likes:
 *                   type: number
 *                   example: 1
 *       401:
 *         description: Unauthorized access attempt.
 */
router.get(
  '/me',
  jwtAuth,
  asyncHandler(async (req, res) => {
    const userId = (req as any).user.id as Types.ObjectId
    return match(await getUserInfo(userId))
      .with({ success: true }, ({ payload }) => res.status(200).json(toUserDto(payload)))
      .exhaustive()
  })
)

/**
 * @swagger
 * /api/auth/token:
 *   post:
 *     summary: Generate token pair for specified user credentials.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: qwerty
 *               password:
 *                 type: string
 *                 example: password
 *     responses:
 *       200:
 *         description: Authorization token was generated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access:
 *                   type: string
 *                   description: Access token
 *                   example: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.e30.yXvILkvUUCBqAFlAv6wQ1Q-QRAjfe3eSosO949U73Vo
 *                 refresh:
 *                   type: string
 *                   description: Refresh token
 *                   example: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.e30.yXvILkvUUCBqAFlAv6wQ1Q-QRAjfe3eSosO949U73Vo
 *       400:
 *         description: Validation errors occurred.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                   nullable: true
 *                   example: User with such username does not exist.
 *                 password:
 *                   type: string
 *                   nullable: true
 *                   example: Incorrect password provided.
 */
router.post(
  '/token',
  validateWith(issueTokenPairSchema),
  asyncHandler(async (req, res) =>
    match(await issueTokenPair(req.body))
      .with({ success: true }, ({ payload }) => res.status(200).json(payload))
      .with({ success: false }, ({ validationErrors }) => res.status(400).json(validationErrors))
      .exhaustive()
  )
)

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh token pair.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refresh:
 *                 type: string
 *                 example: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.e30.yXvILkvUUCBqAFlAv6wQ1Q-QRAjfe3eSosO949U73Vo
 *     responses:
 *       200:
 *         description: Authorization token was generated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access:
 *                   type: string
 *                   description: Access token
 *                   example: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.e30.yXvILkvUUCBqAFlAv6wQ1Q-QRAjfe3eSosO949U73Vo
 *                 refresh:
 *                   type: string
 *                   description: Refresh token
 *                   example: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.e30.yXvILkvUUCBqAFlAv6wQ1Q-QRAjfe3eSosO949U73Vo
 *       400:
 *         description: Validation errors occurred.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                   nullable: true
 *                   example: User with such username does not exist.
 *                 password:
 *                   type: string
 *                   nullable: true
 *                   example: Incorrect password provided.
 */
router.post(
  '/refresh',
  validateWith(refreshTokenPairSchema),
  asyncHandler(async (req, res) =>
    match(await refreshTokenPair(req.body.refresh))
      .with({ success: true }, ({ payload }) => res.status(200).json(payload))
      .with({ success: false }, ({ unauthorized }) => res.status(401).json(unauthorized))
      .exhaustive()
  )
)

export default router
