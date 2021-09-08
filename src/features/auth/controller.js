const { Router } = require('express')
const asyncHandler = require('express-async-handler')

const { jwtAuth, validateWith } = require('../utils/controller')

const { toUserDto } = require('./dtos')
const { generateTokenSchema } = require('./schemas')
const { generateToken, getUserInfo } = require('./service')

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
    const userId = req.user.id
    const result = await getUserInfo(userId)

    if (result.success) {
      const userDto = toUserDto(result.payload)
      res.status(200).json(userDto)
    }
  })
)

/**
 * @swagger
 * /api/auth/token:
 *   post:
 *     summary: Generate authorization token for specified user credentials.
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
 *               type: string
 *               description: Authorization token
 *               example: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.e30.yXvILkvUUCBqAFlAv6wQ1Q-QRAjfe3eSosO949U73Vo
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
  validateWith(generateTokenSchema),
  asyncHandler(async (req, res) => {
    const result = await generateToken(req.body)

    if (!result.success && result.validationErrors) {
      res.status(400).json(result.validationErrors)
      return
    }

    const authToken = result.payload
    res.status(200).json(authToken)
  })
)

module.exports = router
