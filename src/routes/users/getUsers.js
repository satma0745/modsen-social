const { User } = require('../../models')
const { toCompactUserDto } = require('../../mappers').user
const { handleAsync } = require('../shared')

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users.
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: A list of users.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: 6128bde4c7f13866c4b5c3af
 *                   username:
 *                     type: string
 *                     example: qwerty
 *                   headline:
 *                     type: string
 *                     example: Hello, my name is Qwerty.
 *                   likes:
 *                     type: number
 *                     example: 1
 */
const getUsers = handleAsync(async (_, res) => {
  const users = await User.find({})
  const dtos = users.map(toCompactUserDto)
  res.status(200).send(dtos)
})

module.exports = getUsers
