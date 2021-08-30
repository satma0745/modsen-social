const { checkSchema } = require('express-validator')
const { User } = require('../../models')
const { handleAsync, validObjectId, toObjectId } = require('../shared')

const schema = checkSchema({
  id: {
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

const remove = (array, element) => {
  const indexToRemove = array.indexOf(element)
  if (indexToRemove >= 0) {
    array.splice(indexToRemove, 1)
  }
}

/**
 * @swagger
 * /api/users/{id}/unlike:
 *   post:
 *     summary: Unlike user's profile.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User id to unlike.
 *         schema:
 *           type: string
 *           example: 6128bde4c7f13866c4b5c3af
 *     responses:
 *       200:
 *         description: User profile unliked successfully.
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
 *                    id:
 *                      type: string
 *                      nullable: true
 *                      example: Invalid users id.
 *       401:
 *         description: Unauthorized access attempt.
 *       404:
 *         description: User with provided id does not exist.
 */
const handler = handleAsync(async (req, res) => {
  if (!(await User.existsWithId(req.params.id))) {
    res.status(404).send('User with provided id does not exist.')
    return
  }

  const requester = await User.findById(req.user.id)
  const target = await User.findById(req.params.id)

  if (!requester.profile.liked.includes(target._id)) {
    res.status(400).send('User profile was not previously liked by the requester.')
    return
  }

  remove(requester.profile.liked, target._id)
  await requester.save()

  remove(target.profile.likedBy, requester._id)
  await target.save()

  res.sendStatus(200)
})

module.exports = { schema, handler }
