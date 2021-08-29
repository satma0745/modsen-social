const { Router } = require('express')
const { jwtAuth } = require('../shared')

const generateToken = require('./generateToken')
const userInfo = require('./userInfo')

const router = Router()

router.get('/me', jwtAuth, userInfo)
router.post('/token', generateToken.schema, generateToken.handler)

module.exports = router
