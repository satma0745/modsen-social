const { toCompactUserDto } = require('../../mappers').user
const { User } = require('../../models')
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
 *                 headline:
 *                   type: string
 *                   example: Hello, my name is Qwerty.
 *       401:
 *         description: Unauthorized access attempt.
 */
const userInfo = handleAsync(async (req, res) => {
  const user = await User.findById(req.user.id)
  const dto = toCompactUserDto(user)
  res.status(200).send(dto)
})

module.exports = userInfo
