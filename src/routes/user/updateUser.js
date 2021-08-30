const { checkSchema } = require('express-validator')
const { User } = require('../../models')
const { validObjectId, handleAsync, toObjectId } = require('../shared')

const schema = checkSchema({
  id: {
    in: 'params',
    notEmpty: true,
    errorMessage: 'User id is required.',
    custom: {
      options: validObjectId('Invalid user id.'),
    },
    customSanitizer: {
      options: toObjectId,
    },
  },
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
  'profile.headline': {
    in: 'body',
    isLength: {
      options: { max: 100 },
      errorMessage: 'Profile headline cannot exceed 100 characters.',
    },
  },
  'profile.bio': {
    in: 'body',
    isLength: {
      options: { max: 4000 },
      errorMessage: 'Bio cannot exceed 4000 characters.',
    },
  },
  'profile.contacts': {
    in: 'body',
    custom: {
      options: (contacts) => {
        if (!contacts) {
          throw new Error('User contacts are required.')
        }
        if (!Array.isArray(contacts) || typeof contacts === 'string') {
          throw new Error('Contacts must be an array.')
        }

        contacts.forEach((contact) => {
          if (typeof contact !== 'object') {
            throw new Error('Each contact record must be an object.')
          }

          if (!contact.type) {
            throw new Error('Each contact record must contain type field.')
          }
          if (typeof contact.type !== 'string') {
            throw new Error('Contact record type must be of type string.')
          }
          if (contact.type.length > 20) {
            throw new Error('Contact record type cannot exceed 20 characters.')
          }

          if (!contact.type) {
            throw new Error('Each contact record must contain value field.')
          }
          if (typeof contact.value !== 'string') {
            throw new Error('Contact record value must be of type string.')
          }
          if (contact.value.length > 100) {
            throw new Error('Contact record value cannot exceed 100 characters.')
          }
        })

        return true
      },
    },
  },
})

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update specific user.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User id to update.
 *         schema:
 *           type: string
 *           example: 6128bde4c7f13866c4b5c3af
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
 *               profile:
 *                 type: object
 *                 properties:
 *                   headline:
 *                     type: string
 *                     nullable: true
 *                     maxLength: 100
 *                     example: Hello, my name is Qwerty.
 *                   bio:
 *                     type: string
 *                     nullable: true
 *                     maxLength: 4000
 *                     example: Here are some facts about me ...
 *                   contacts:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         type:
 *                           type: string
 *                           maxLength: 20
 *                           example: Phone number
 *                         value:
 *                           type: string
 *                           maxLength: 100
 *                           example: +12 (34) 56-78-90
 *     responses:
 *       200:
 *         description: User was updated successfully.
 *       400:
 *         description: Validation errors occurred.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   nullable: true
 *                   example: Invalid user id.
 *                 username:
 *                   type: string
 *                   nullable: true
 *                   example: Username must be at least 6 and at most 20 characters long.
 *                 password:
 *                   type: string
 *                   nullable: true
 *                   example: Password is required.
 *                 profile.headline:
 *                   type: string
 *                   nullable: true
 *                   example: Profile headline cannot exceed 100 characters.
 *                 profile.bio:
 *                   type: string
 *                   nullable: true
 *                   example: Bio cannot exceed 4000 characters.
 *                 profile.contacts:
 *                   type: string
 *                   nullable: true
 *                   example: Contacts must be an array.
 *       401:
 *         description: Unauthorized access attempt.
 *       403:
 *         description: Access denied.
 *       404:
 *         description: User with provided id does not exist.
 */
const handler = handleAsync(async (req, res) => {
  if (!(await User.existsWithId(req.params.id))) {
    res.status(404).send('User with provided id does not exist.')
    return
  }

  if (await User.existsWithUsername(req.body.username, req.params.id)) {
    const response = { username: 'Username already taken by someone else.' }
    res.status(400).send(response)
    return
  }

  if (!req.params.id.equals(req.user.id)) {
    res.sendStatus(403)
    return
  }

  await User.findByIdAndUpdate(req.params.id, req.body, { runValidators: true })
  res.sendStatus(200)
})

module.exports = { schema, handler }
