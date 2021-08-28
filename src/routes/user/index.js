const { Router } = require('express')

const getUsers = require('./getUsers')
const registerUser = require('./registerUser')
const updateUser = require('./updateUser')
const deleteUser = require('./deleteUser')

const router = Router()

router.get('/', getUsers)
router.post('/', registerUser)
router.put('/:id', updateUser)
router.delete('/:id', deleteUser)

module.exports = router
