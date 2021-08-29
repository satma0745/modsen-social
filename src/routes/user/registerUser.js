const { checkSchema } = require('express-validator')
const { User } = require('../../schemas')
const { handleAsync } = require('../shared')

const schema = checkSchema({
  username: {
    in: 'body',
    notEmpty: true,
    errorMessage: 'Username is required.',
    isLength: {
      options: { min: 6, max: 20 },
      errorMessage: 'Username must be at least 6 and at most 20 characters long.',
    },
  },
  password: {
    in: 'body',
    notEmpty: true,
    errorMessage: 'Password is required.',
    isLength: {
      options: { min: 6, max: 20 },
      errorMessage: 'Password must be at least 6 and at most 20 characters long.',
    },
  },
})

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
 *                 minLength: 6
 *                 maxLength: 20
 *                 example: qwerty
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 20
 *                 example: password
 *     responses:
 *       201:
 *         description: User was registered successfully.
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
 *                   example: Username must be at least 6 and at most 20 characters long.
 *                 password:
 *                   type: string
 *                   nullable: true
 *                   example: Password is required.
 */
const handler = handleAsync(async (req, res) => {
  if (await User.existsWithUsername(req.body.username)) {
    const response = { username: 'Username already taken by someone else.' }
    res.status(400).send(response)
    return
  }

  const user = new User(req.body)
  await user.save()
  res.sendStatus(201)
})

module.exports = { schema, handler }
