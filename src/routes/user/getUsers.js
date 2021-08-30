const { User } = require('../../models')
const { toUserDtos } = require('../../mappers').user
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
 *                   profile:
 *                     type: object
 *                     properties:
 *                       headline:
 *                         type: string
 *                         example: Hello, my name is Qwerty.
 *                       bio:
 *                         type: string
 *                         example: Here are some facts about me ...
 *                       contacts:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             type:
 *                               type: string
 *                               example: Phone number
 *                             value:
 *                               type: string
 *                               example: +12 (34) 56-78-90
 */
const getUsers = handleAsync(async (_, res) => {
  const users = await User.find({})
  const dtos = toUserDtos(users)
  res.status(200).send(dtos)
})

module.exports = getUsers
