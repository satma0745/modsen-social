const { verify } = require('jsonwebtoken')

const { toUserDto } = require('../../mappers').user
const { User } = require('../../schemas')

const { handleAsync } = require('../shared')

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
 *       401:
 *         description: Unauthorized access attempt.
 */
const userInfo = handleAsync(async (req, res) => {
  try {
    const token = req.headers.authorization.replace('Bearer', '').trim()
    const payload = verify(token, process.env.TOKEN_SECRET)

    if (!(await User.existsWithId(payload.sub))) {
      res.sendStatus(401)
      return
    }

    const user = await User.findById(payload.sub)
    const dto = toUserDto(user)
    res.status(200).send(dto)
  } catch {
    res.sendStatus(401)
  }
})

module.exports = userInfo
