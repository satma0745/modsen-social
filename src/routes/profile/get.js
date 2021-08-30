const { checkSchema } = require('express-validator')

const { User } = require('../../models')
const { toProfileDto } = require('../../mappers').profile

const { handleAsync, validObjectId, toObjectId } = require('../shared')

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
})

/**
 * @swagger
 * /api/users/{userId}/profile:
 *   get:
 *     summary: Get user's profile.
 *     tags:
 *       - User profile
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: Profile owner's id.
 *         schema:
 *           type: string
 *           example: 6128bde4c7f13866c4b5c3af
 *     responses:
 *       200:
 *         description: User profile was retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 headline:
 *                   type: string
 *                   nullable: true
 *                   example: Hello, my name is Qwerty.
 *                 bio:
 *                   type: string
 *                   nullable: true
 *                   example: Here are some facts about me ...
 *                 likes:
 *                   type: string
 *                   nullable: true
 *                   example: 1
 *                 contacts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         example: Phone number
 *                       value:
 *                         type: string
 *                         example: +12 (34) 56-78-90
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
 *       404:
 *         description: User with provided id does not exist.
 */
const handler = handleAsync(async (req, res) => {
  if (!(await User.existsWithId(req.params.userId))) {
    res.status(404).send('User with provided id does not exist.')
    return
  }

  const user = await User.findById(req.params.userId)
  const dto = toProfileDto(user)
  res.status(200).send(dto)
})

module.exports = { schema, handler }
