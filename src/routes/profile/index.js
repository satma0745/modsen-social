const { Router } = require('express')
const { jwtAuth } = require('../shared')

const fans = require('./fans')
const get = require('./get')
const like = require('./like')
const unlike = require('./unlike')
const update = require('./update')

const router = Router({ mergeParams: true })

router.get('/', get.schema, get.handler)
router.get('/fans', fans.schema, fans.handler)

router.put('/', update.schema, jwtAuth, update.handler)
router.post('/like', like.schema, jwtAuth, like.handler)
router.post('/unlike', unlike.schema, jwtAuth, unlike.handler)

module.exports = router
