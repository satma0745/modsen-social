const { checkSchema } = require('express-validator')
const { User } = require('../../models')
const { validObjectId, handleAsync, toObjectId, ofType } = require('../shared')

const schema = checkSchema({
  userId: {
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
  headline: {
    in: 'body',
    custom: {
      options: ofType(['undefined', 'string'], 'Headline must be of type string.'),
    },
    isLength: {
      options: { max: 100 },
      errorMessage: 'Profile headline cannot exceed 100 characters.',
    },
  },
  bio: {
    in: 'body',
    custom: {
      options: ofType(['undefined', 'string'], 'Bio must be of type string.'),
    },
    isLength: {
      options: { max: 4000 },
      errorMessage: 'Bio cannot exceed 4000 characters.',
    },
  },
  contacts: {
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
 * /api/users/{userId}/profile:
 *   put:
 *     summary: Update user profile.
 *     tags:
 *       - User profile
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: Profile owner's id.
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
 *               headline:
 *                 type: string
 *                 nullable: true
 *                 maxLength: 100
 *                 example: Hello, my name is Qwerty.
 *               bio:
 *                 type: string
 *                 nullable: true
 *                 maxLength: 4000
 *                 example: Here are some facts about me ...
 *               contacts:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       maxLength: 20
 *                       example: Phone number
 *                     value:
 *                       type: string
 *                       maxLength: 100
 *                       example: +12 (34) 56-78-90
 *     responses:
 *       200:
 *         description: User profile was updated successfully.
 *       400:
 *         description: Validation errors occurred.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                   nullable: true
 *                   example: Invalid user id.
 *                 headline:
 *                   type: string
 *                   nullable: true
 *                   example: Profile headline cannot exceed 100 characters.
 *                 bio:
 *                   type: string
 *                   nullable: true
 *                   example: Bio cannot exceed 4000 characters.
 *                 contacts:
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
  if (!(await User.existsWithId(req.params.userId))) {
    res.status(404).send('User with provided id does not exist.')
    return
  }

  if (!req.params.userId.equals(req.user.id)) {
    res.sendStatus(403)
    return
  }

  const user = await User.findById(req.params.userId)
  user.profile = req.body
  await user.save()

  res.sendStatus(200)
})

module.exports = { schema, handler }
