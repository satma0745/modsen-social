const { Router } = require('express')

const generateToken = require('./generateToken')
const userInfo = require('./userInfo')

const router = Router()

router.get('/me', userInfo)
router.post('/token', generateToken.schema, generateToken.handler)

module.exports = router
