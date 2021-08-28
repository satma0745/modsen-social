const {
  isValidObjectId,
  Types: { ObjectId },
} = require('mongoose')

const { User } = require('../../schemas')
const { handleAsync } = require('../utils')

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update specific user.
 *     tags:
 *       - Users
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
 *                 example: qwerty
 *               password:
 *                 type: string
 *                 example: pa$$word
 *     responses:
 *       200:
 *         description: User was updated successfully.
 *       400:
 *         description: Validation error.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               description: Error message.
 *               example: Invalid user id.
 */
const updateUser = handleAsync(async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    res.status(400).send('Invalid user id.')
    return
  }
  const id = new ObjectId(req.params.id)

  await User.findByIdAndUpdate(id, req.body, { runValidators: true })
  res.sendStatus(200)
})

module.exports = updateUser
