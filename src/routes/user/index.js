const { Router } = require('express')
const { jwtAuth } = require('../shared')

const deleteUser = require('./deleteUser')
const getUser = require('./getUser')
const getUsers = require('./getUsers')
const registerUser = require('./registerUser')
const updateUser = require('./updateUser')

const router = Router()

router.get('/', getUsers)
router.get('/:id', getUser.schema, getUser.handler)

router.post('/', registerUser.schema, registerUser.handler)
router.put('/:id', updateUser.schema, jwtAuth, updateUser.handler)

router.delete('/:id', deleteUser.schema, jwtAuth, deleteUser.handler)

module.exports = router
