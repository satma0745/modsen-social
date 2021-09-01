const { checkSchema } = require('express-validator')
const { sign } = require('jsonwebtoken')

const { User } = require('../../models')
const { handleAsync } = require('../shared')

const schema = checkSchema({
  username: {
    in: 'body',
    notEmpty: true,
    errorMessage: 'Username is required.',
  },
  password: {
    in: 'body',
    notEmpty: true,
    errorMessage: 'Password is required.',
  },
})

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
const handler = handleAsync(async (req, res) => {
  if (!(await User.existsWithUsername(req.body.username))) {
    const response = { username: 'User with such username does not exist.' }
    res.status(400).json(response)
    return
  }

  const user = await User.findByUsername(req.body.username)
  if (req.body.password !== user.password) {
    const response = { password: 'Incorrect password provided.' }
    res.status(400).json(response)
    return
  }

  const token = sign({ sub: user.id }, process.env.TOKEN_SECRET, { expiresIn: '30 days' })
  res.status(200).json(token)
})

module.exports = { schema, handler }
