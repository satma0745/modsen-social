const { Router } = require('express')
const { jwtAuth, validateWith } = require('../utils/controller')
const { getAllUsers, getSingleUser, registerNewUser, updateUser, deleteUser } = require('./service')
const { getSingleUserSchema, registerNewUserSchema, updateUserSchema, deleteUserSchema } = require('./schemas')
const { toUserDto, toUserDtos } = require('./dtos')

const router = Router()

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users.
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: A list of users.
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
 */
router.get('/', async (req, res, next) => {
  try {
    const result = await getAllUsers()
    if (result.success) {
      const userDtos = toUserDtos(result.payload)
      res.status(200).json(userDtos)
    }
  } catch (err) {
    next(err)
  }
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
 *                 headline:
 *                   type: string
 *                   nullable: true
 *                   example: Hello, my name is Qwerty.
 *                 likes:
 *                   type: string
 *                   example: 1
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
router.get('/:id', validateWith(getSingleUserSchema), async (req, res, next) => {
  try {
    const userId = req.params.id
    const result = await getSingleUser(userId)

    if (!result.success && result.notFound) {
      const message = typeof result.payload === 'string' ? result.payload : undefined
      res.status(404).json(message)
      return
    }

    if (result.success) {
      const userDto = toUserDto(result.payload)
      res.status(200).json(userDto)
    }
  } catch (err) {
    next(err)
  }
})

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Register a new user.
 *     tags:
 *       - Users
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
 *     responses:
 *       201:
 *         description: User was registered successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               description: Registered user id.
 *               example: 6128bde4c7f13866c4b5c3af
 *       400:
 *         description: Validation errors occurred.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                   nullable: true
 *                   example: Username must be at least 6 and at most 20 characters long.
 *                 password:
 *                   type: string
 *                   nullable: true
 *                   example: Password is required.
 */
router.post('/', validateWith(registerNewUserSchema), async (req, res, next) => {
  try {
    const result = await registerNewUser(req.body)

    if (!result.success && result.validationErrors) {
      res.status(400).json(result.validationErrors)
      return
    }

    const userId = result.payload
    res.status(201).json(userId)
  } catch (err) {
    next(err)
  }
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
 *       401:
 *         description: Unauthorized access attempt.
 *       403:
 *         description: Access denied.
 *       404:
 *         description: User with provided id does not exist.
 */
router.put('/:id', validateWith(updateUserSchema), jwtAuth, async (req, res, next) => {
  try {
    const result = await updateUser({ requesterId: req.user.id, userId: req.params.id, ...req.body })

    if (!result.success && result.validationErrors) {
      res.status(400).json(result.validationErrors)
      return
    }
    if (!result.success && result.accessViolation) {
      res.sendStatus(403)
      return
    }
    if (!result.success && result.notFound) {
      res.sendStatus(404)
      return
    }

    if (result.success) {
      res.sendStatus(200)
    }
  } catch (err) {
    next(err)
  }
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
router.delete('/:id', validateWith(deleteUserSchema), jwtAuth, async (req, res, next) => {
  try {
    const result = await deleteUser({ requesterId: req.user.id, userId: req.params.id })

    if (!result.success && result.validationErrors) {
      res.status(400).json(result.validationErrors)
      return
    }
    if (!result.success && result.accessViolation) {
      res.sendStatus(403)
      return
    }
    if (!result.success && result.notFound) {
      res.sendStatus(404)
      return
    }

    if (result.success) {
      res.sendStatus(200)
    }
  } catch (err) {
    next(err)
  }
})

module.exports = router
