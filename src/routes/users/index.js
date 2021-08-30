const { Router } = require('express')
const { jwtAuth } = require('../shared')

const $delete = require('./delete')
const getSingle = require('./getSingle')
const getAll = require('./getAll')
const register = require('./register')
const update = require('./update')

const router = Router()

router.get('/', getAll)
router.get('/:id', getSingle.schema, getSingle.handler)

router.post('/', register.schema, register.handler)
router.put('/:id', update.schema, jwtAuth, update.handler)
router.delete('/:id', $delete.schema, jwtAuth, $delete.handler)

module.exports = router
