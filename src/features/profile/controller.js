const { Router } = require('express')
const asyncHandler = require('express-async-handler')

const { jwtAuth, validateWith } = require('../utils/controller')

const { toUserDtos, toProfileDto } = require('./dtos')
const {
  getUserProfileSchema,
  getFansSchema,
  getFavoritesSchema,
  updateUserProfileSchema,
  likeProfileSchema,
  unlikeProfileSchema,
} = require('./schemas')
const { getUserProfile, getFans, getFavorites, updateUserProfile, likeProfile, unlikeProfile } = require('./service')

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
    const result = await getUserProfile(req.params.userId)

    if (!result.success && result.notFound) {
      const message = typeof result.notFound === 'string' ? result.notFound : undefined
      res.status(404).json(message)
      return
    }

    if (result.success) {
      const userDto = toProfileDto(result.payload)
      res.status(200).json(userDto)
    }
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
    const result = await getFans(req.params.userId)

    if (!result.success && result.notFound) {
      const message = typeof result.notFound === 'string' ? result.notFound : undefined
      res.status(404).json(message)
      return
    }

    if (result.success) {
      const fanDtos = toUserDtos(result.payload)
      res.status(200).json(fanDtos)
    }
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
    const result = await getFavorites(req.params.userId)

    if (!result.success && result.notFound) {
      const message = typeof result.notFound === 'string' ? result.notFound : undefined
      res.status(404).json(message)
      return
    }

    if (result.success) {
      const favoriteDtos = toUserDtos(result.payload)
      res.status(200).json(favoriteDtos)
    }
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
    const result = await updateUserProfile({ requesterId: req.user.id, userId: req.params.userId, ...req.body })

    if (!result.success && result.notFound) {
      const message = typeof result.notFound === 'string' ? result.notFound : undefined
      res.status(404).json(message)
      return
    }
    if (!result.success && result.accessViolation) {
      res.sendStatus(403)
      return
    }

    if (result.success) {
      res.sendStatus(200)
    }
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
    const result = await likeProfile({ requesterId: req.user.id, profileOwnerId: req.params.userId })

    if (!result.success && result.notFound) {
      const message = typeof result.notFound === 'string' ? result.notFound : undefined
      res.status(404).json(message)
      return
    }
    if (!result.response && result.conflict) {
      const message = result.conflict
      res.status(400).json(message)
      return
    }

    if (result.success) {
      res.sendStatus(200)
    }
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
    const result = await unlikeProfile({ requesterId: req.user.id, profileOwnerId: req.params.userId })

    if (!result.success && result.notFound) {
      const message = typeof result.notFound === 'string' ? result.notFound : undefined
      res.status(404).json(message)
      return
    }
    if (!result.response && result.conflict) {
      const message = result.conflict
      res.status(400).json(message)
      return
    }

    if (result.success) {
      res.sendStatus(200)
    }
  })
)

module.exports = router
