import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import { __, match } from 'ts-pattern'
import { Types } from 'mongoose'

import { jwtAuth, validateWith } from '../utils/controller'

import { toUserDtos, toProfileDto } from './dtos'
import {
  getUserProfileSchema,
  getFansSchema,
  getFavoritesSchema,
  updateUserProfileSchema,
  likeProfileSchema,
  unlikeProfileSchema,
} from './schemas'
import { getUserProfile, getFans, getFavorites, updateUserProfile, likeProfile, unlikeProfile } from './service'

const router = Router({ mergeParams: true })

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
 *                 userId:
 *                   type: string
 *                   nullable: true
 *                   example: Invalid user id.
 *       404:
 *         description: User with provided id does not exist.
 */
router.get(
  '/',
  validateWith(getUserProfileSchema),
  asyncHandler(async (req, res) => {
    const userId = req.params.userId as any as Types.ObjectId
    return match(await getUserProfile(userId))
      .with({ success: true }, ({ payload }) => res.status(200).json(toProfileDto(payload)))
      .with({ success: false }, ({ notFound }) => res.status(404).json(notFound))
      .exhaustive()
  })
)

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
router.get(
  '/fans',
  validateWith(getFansSchema),
  asyncHandler(async (req, res) => {
    const userId = req.params.userId as any as Types.ObjectId
    return match(await getFans(userId))
      .with({ success: true }, ({ payload }) => res.status(200).json(toUserDtos(payload)))
      .with({ success: false }, ({ notFound }) => res.status(404).json(notFound))
      .exhaustive()
  })
)

/**
 * @swagger
 * /api/users/{userId}/profile/favorites:
 *   get:
 *     summary: Get user's favorites.
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
 *         description: User's favorites were retrieved successfully.
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
router.get(
  '/favorites',
  validateWith(getFavoritesSchema),
  asyncHandler(async (req, res) => {
    const userId = req.params.userId as any as Types.ObjectId
    return match(await getFavorites(userId))
      .with({ success: true }, ({ payload }) => res.status(200).json(toUserDtos(payload)))
      .with({ success: false }, ({ notFound }) => res.status(404).json(notFound))
      .exhaustive()
  })
)

/**
 * @swagger
 * /api/users/{userId}/profile:
 *   put:
 *     summary: Update user profile.
 *     tags:
 *       - User profile
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: Profile owner's id.
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
 *               headline:
 *                 type: string
 *                 nullable: true
 *                 maxLength: 100
 *                 example: Hello, my name is Qwerty.
 *               bio:
 *                 type: string
 *                 nullable: true
 *                 maxLength: 4000
 *                 example: Here are some facts about me ...
 *               contacts:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       maxLength: 20
 *                       example: Phone number
 *                     value:
 *                       type: string
 *                       maxLength: 100
 *                       example: +12 (34) 56-78-90
 *     responses:
 *       200:
 *         description: User profile was updated successfully.
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
 *                 headline:
 *                   type: string
 *                   nullable: true
 *                   example: Profile headline cannot exceed 100 characters.
 *                 bio:
 *                   type: string
 *                   nullable: true
 *                   example: Bio cannot exceed 4000 characters.
 *                 contacts:
 *                   type: string
 *                   nullable: true
 *                   example: Contacts must be an array.
 *       401:
 *         description: Unauthorized access attempt.
 *       403:
 *         description: Access denied.
 *       404:
 *         description: User with provided id does not exist.
 */
router.put(
  '/',
  validateWith(updateUserProfileSchema),
  jwtAuth,
  asyncHandler(async (req, res) => {
    const requesterId = (req as any).user.id as Types.ObjectId
    return match(await updateUserProfile({ requesterId, userId: req.params.userId, ...req.body }))
      .with({ success: true }, () => res.sendStatus(200))
      .with({ accessViolation: true }, () => res.sendStatus(403))
      .with({ notFound: __.string }, ({ notFound }) => res.status(404).json(notFound))
      .exhaustive()
  })
)

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
router.post(
  '/like',
  validateWith(likeProfileSchema),
  jwtAuth,
  asyncHandler(async (req, res) => {
    const requesterId = (req as any).user.id as Types.ObjectId
    return match(await likeProfile({ requesterId, profileOwnerId: req.params.userId }))
      .with({ success: true }, () => res.sendStatus(200))
      .with({ conflict: __.string }, ({ conflict }) => res.sendStatus(400).json(conflict))
      .with({ notFound: __.string }, ({ notFound }) => res.status(404).json(notFound))
      .exhaustive()
  })
)

/**
 * @swagger
 * /api/users/{userId}/profile/unlike:
 *   post:
 *     summary: Unlike user's profile.
 *     tags:
 *       - User profile
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
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
 *                    userId:
 *                      type: string
 *                      nullable: true
 *                      example: Invalid users id.
 *       401:
 *         description: Unauthorized access attempt.
 *       404:
 *         description: User with provided id does not exist.
 */
router.post(
  '/unlike',
  validateWith(unlikeProfileSchema),
  jwtAuth,
  asyncHandler(async (req, res) => {
    const requesterId = (req as any).user.id as Types.ObjectId
    return match(await unlikeProfile({ requesterId, profileOwnerId: req.params.userId }))
      .with({ success: true }, () => res.sendStatus(200))
      .with({ conflict: __.string }, ({ conflict }) => res.sendStatus(400).json(conflict))
      .with({ notFound: __.string }, ({ notFound }) => res.status(404).json(notFound))
      .exhaustive()
  })
)

export default router
