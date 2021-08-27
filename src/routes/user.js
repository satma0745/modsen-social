const express = require('express')
const {
  isValidObjectId,
  Types: { ObjectId },
} = require('mongoose')

const { User } = require('../schemas')
const { handleAsync, toDto } = require('./utils')

const router = express.Router()

router.get(
  '/',
  handleAsync(async (_, res) => {
    const users = await User.find({})
    const dtos = users.map(toDto)
    res.status(200).send(dtos)
  })
)

router.post(
  '/',
  handleAsync(async (req, res) => {
    const user = new User(req.body)
    await user.save()
    res.sendStatus(201)
  })
)

router.put(
  '/:id',
  handleAsync(async (req, res) => {
    console.log([isValidObjectId(req.params.id) ? 'valid' : 'invalid', req.params.id])
    if (!isValidObjectId(req.params.id)) {
      res.status(400).send('Invalid user id')
      return
    }
    const id = new ObjectId(req.params.id)

    await User.findByIdAndUpdate(id, req.body, { runValidators: true })
    res.sendStatus(200)
  })
)

router.delete(
  '/:id',
  handleAsync(async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
      res.status(400).send('Invalid user id')
      return
    }
    const id = new ObjectId(req.params.id)

    await User.findByIdAndDelete(id)
    res.sendStatus(200)
  })
)

module.exports = router
