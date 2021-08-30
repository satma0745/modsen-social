const { checkSchema } = require('express-validator')

const { User } = require('../../models')
const { toRichUserDto } = require('../../mappers').user

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
 *   get:
 *     summary: Get specific user.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User id to retrieve.
 *         schema:
 *           type: string
 *           example: 6128bde4c7f13866c4b5c3af
 *     responses:
 *       200:
 *         description: User with specified id was retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: 6128bde4c7f13866c4b5c3af
 *                 username:
 *                   type: string
 *                   example: qwerty
 *                 profile:
 *                   type: object
 *                   properties:
 *                     headline:
 *                       type: string
 *                       example: Hello, my name is Qwerty.
 *                     bio:
 *                       type: string
 *                       example: Here are some facts about me ...
 *                     contacts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             example: Phone number
 *                           value:
 *                             type: string
 *                             example: +12 (34) 56-78-90
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
  if (!(await User.existsWithId(req.params.id))) {
    res.status(404).send('User with provided id does not exist.')
    return
  }

  const user = await User.findById(req.params.id)
  const dto = toRichUserDto(user)
  res.status(200).send(dto)
})

module.exports = { schema, handler }
