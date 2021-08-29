const { Router } = require('express')

const getUsers = require('./getUsers')
const registerUser = require('./registerUser')
const updateUser = require('./updateUser')
const deleteUser = require('./deleteUser')

const router = Router()

router.get('/', getUsers)
router.post('/', registerUser.schema, registerUser.handler)
router.put('/:id', updateUser.schema, updateUser.handler)
router.delete('/:id', deleteUser.schema, deleteUser.handler)

module.exports = router
