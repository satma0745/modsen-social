const { checkSchema } = require('express-validator')
const { User } = require('../../schemas')
const { handleAsync, validObjectId, toObjectId } = require('../shared')

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
})

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete specific user.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User id to delete.
 *         schema:
 *           type: string
 *           example: 6128bde4c7f13866c4b5c3af
 *     responses:
 *       200:
 *         description: User was deleted successfully.
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

  if (!req.params.id.equals(req.user.id)) {
    res.sendStatus(403)
    return
  }

  await User.findByIdAndDelete(req.params.id)
  res.sendStatus(200)
})

module.exports = { schema, handler }
