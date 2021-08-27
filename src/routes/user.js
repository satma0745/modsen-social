const express = require('express')
const { User } = require('../schemas')

const router = express.Router()

router.get('/', async (_, res) => {
  const users = await User.find({})
  res.status(200).send(users)
})

router.post('/', async (req, res) => {
  const user = new User(req.body)
  await user.save()
  res.sendStatus(201)
})

module.exports = router
