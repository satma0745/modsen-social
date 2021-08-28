const { User } = require('../../schemas')
const { handleAsync } = require('../utils')

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Register a new user.
 *     tags:
 *       - Users
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
 *                 example: pa$$word
 *     responses:
 *       201:
 *         description: User was registered successfully.
 */
const registerUser = handleAsync(async (req, res) => {
  const user = new User(req.body)
  await user.save()
  res.sendStatus(201)
})

module.exports = registerUser
