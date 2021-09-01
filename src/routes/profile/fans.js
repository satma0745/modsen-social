const { checkSchema } = require('express-validator')

const { User } = require('../../models')
const { toUserDtos } = require('../../mappers').user

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
 * /api/users/{userId}/profile/fans:
 *   get:
 *     summary: Get user profile's fans.
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
 *         description: Users were retrieved successfully.
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
 *                     nullable: true
 *                     example: Hello, my name is Qwerty.
 *                   likes:
 *                     type: number
 *                     example: 1
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
 *       404:
 *         description: User with provided id does not exist.
 */
const handler = handleAsync(async (req, res) => {
  if (!(await User.existsWithId(req.params.userId))) {
    res.status(404).json('User with provided id does not exist.')
    return
  }

  const user = await User.findById(req.params.userId)
  const fans = await User.find({ _id: { $in: user.profile.likedBy } })

  const dtos = toUserDtos(fans)
  res.status(200).json(dtos)
})

module.exports = { schema, handler }
