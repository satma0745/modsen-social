const {
  isValidObjectId,
  Types: { ObjectId },
} = require('mongoose')

const { User } = require('../../schemas')
const { handleAsync } = require('../shared')

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete specific user.
 *     tags:
 *       - Users
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
 *         description: Validation error.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               description: Error message.
 *               example: Invalid user id.
 */
const deleteUser = handleAsync(async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    res.status(400).send('Invalid user id.')
    return
  }
  const id = new ObjectId(req.params.id)

  await User.findByIdAndDelete(id)
  res.sendStatus(200)
})

module.exports = deleteUser
