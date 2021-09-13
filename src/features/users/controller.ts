import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import { __, match, when } from 'ts-pattern'
import { Types } from 'mongoose'

import { jwtAuth, validateWith } from '../utils/controller'

import { toUserDto, toUserDtos } from './dtos'
import { getSingleUserSchema, registerNewUserSchema, updateUserSchema, deleteUserSchema } from './schemas'
import { getAllUsers, getSingleUser, registerNewUser, updateUser, deleteUser } from './service'

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
router.get(
  '/',
  asyncHandler(async (req, res) =>
    match(await getAllUsers())
      .with({ success: true }, ({ payload }) => res.status(200).json(toUserDtos(payload)))
      .exhaustive()
  )
)

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
router.get(
  '/:id',
  validateWith(getSingleUserSchema),
  asyncHandler(async (req, res) => {
    const userId = req.params.id as any as Types.ObjectId
    return match(await getSingleUser(userId))
      .with({ success: true }, ({ payload }) => res.status(200).json(toUserDto(payload)))
      .with({ success: false }, ({ notFound }) => res.status(404).json(notFound))
      .exhaustive()
  })
)

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
router.post(
  '/',
  validateWith(registerNewUserSchema),
  asyncHandler(async (req, res) =>
    match(await registerNewUser(req.body))
      .with({ success: true }, ({ payload }) => res.status(201).json(payload))
      .with({ success: false }, ({ validationErrors }) => res.status(400).json(validationErrors))
      .exhaustive()
  )
)

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
router.put(
  '/:id',
  validateWith(updateUserSchema),
  jwtAuth,
  asyncHandler(async (req, res) => {
    const requesterId = (req as any).user.id as Types.ObjectId
    return match(await updateUser({ requesterId, userId: req.params.id, ...req.body }))
      .with({ success: true }, () => res.sendStatus(200))
      .with({ validationErrors: when((errors) => typeof errors === 'object') }, ({ validationErrors }) =>
        res.status(400).json(validationErrors)
      )
      .with({ accessViolation: true }, () => res.sendStatus(403))
      .with({ notFound: __.string }, ({ notFound }) => res.sendStatus(404).json(notFound))
      .exhaustive()
  })
)

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
router.delete(
  '/:id',
  validateWith(deleteUserSchema),
  jwtAuth,
  asyncHandler(async (req, res) => {
    const requesterId = (req as any).user.id as Types.ObjectId
    const userId = req.params.id as any as Types.ObjectId
    return match(await deleteUser({ requesterId, userId }))
      .with({ success: true }, () => res.sendStatus(200))
      .with({ accessViolation: true }, () => res.sendStatus(403))
      .with({ notFound: __.string }, ({ notFound }) => res.status(404).json(notFound))
      .exhaustive()
  })
)

export default router
