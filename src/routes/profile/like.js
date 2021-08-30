const { checkSchema } = require('express-validator')
const { User } = require('../../models')
const { handleAsync, validObjectId, toObjectId } = require('../shared')

const schema = checkSchema({
  userId: {
    in: 'params',
    notEmpty: true,
    errorMessage: 'User id is required.',
    custom: {
      options: validObjectId('Invalid users id.'),
    },
    customSanitizer: {
      options: toObjectId,
    },
  },
})

/**
 * @swagger
 * /api/users/{userId}/profile/like:
 *   post:
 *     summary: Like user's profile.
 *     tags:
 *       - User profile
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: User id to like.
 *         schema:
 *           type: string
 *           example: 6128bde4c7f13866c4b5c3af
 *     responses:
 *       200:
 *         description: User profile liked successfully.
 *       400:
 *         description: Validation errors occurred.
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                - type: string
 *                  example: User profile was not previously liked by the requester.
 *                - type: object
 *                  properties:
 *                    userId:
 *                      type: string
 *                      nullable: true
 *                      example: Invalid users id.
 *       401:
 *         description: Unauthorized access attempt.
 *       404:
 *         description: User with provided id does not exist.
 */
const handler = handleAsync(async (req, res) => {
  if (!(await User.existsWithId(req.params.userId))) {
    res.status(404).send('User with provided id does not exist.')
    return
  }

  const requester = await User.findById(req.user.id)
  const target = await User.findById(req.params.userId)

  if (requester.profile.liked.includes(target._id)) {
    res.status(400).send('User profile is already liked by the requester.')
    return
  }

  requester.profile.liked.push(target._id)
  await requester.save()

  target.profile.likedBy.push(requester._id)
  await target.save()

  res.sendStatus(200)
})

module.exports = { schema, handler }
