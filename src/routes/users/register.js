const { checkSchema } = require('express-validator')
const { User } = require('../../models')
const { handleAsync } = require('../shared')

const schema = checkSchema({
  username: {
    in: 'body',
    notEmpty: true,
    errorMessage: 'Username is required.',
    isString: {
      options: true,
      errorMessage: 'Username must be of type string.',
    },
    isLength: {
      options: { min: 6, max: 20 },
      errorMessage: 'Username must be at least 6 and at most 20 characters long.',
    },
  },
  password: {
    in: 'body',
    notEmpty: true,
    errorMessage: 'Password is required.',
    isString: {
      options: true,
      errorMessage: 'Password must be of type string.',
    },
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
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               description: Registered user id.
 *               example: 6128bde4c7f13866c4b5c3af
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

  const id = user._id.toString()
  res.status(201).send(id)
})

module.exports = { schema, handler }
