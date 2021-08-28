const { User } = require('../../schemas')
const { handleAsync, toDto } = require('../utils')

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
 *                   password:
 *                     type: string
 *                     example: pa$$word
 */
const getUsers = handleAsync(async (_, res) => {
  const users = await User.find({})
  const dtos = users.map(toDto)
  res.status(200).send(dtos)
})

module.exports = getUsers
