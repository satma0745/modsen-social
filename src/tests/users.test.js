const chai = require('chai')
const chaiHttp = require('chai-http')
const { sign } = require('jsonwebtoken')

const { User } = require('../models')
const serverPromise = require('../server')

chai.should()
chai.use(chaiHttp)

describe('User CRUD', () => {
  let server
  let dbConnection

  before(async () => {
    const { app, db } = await serverPromise

    server = app
    dbConnection = db

    await db.dropDatabase()
  })
  after(() => {
    return dbConnection.dropDatabase()
  })

  describe('POST: /api/users - Register a new user.', () => {
    after(() => {
      return dbConnection.db.dropCollection('users')
    })

    it('No user data.', async () => {
      const response = await chai.request(server).post('/api/users').send({})

      response.should.have.status(400)
      response.body.should.be.a('object')
      response.body.should.have.property('username').eq('Username is required.')
      response.body.should.have.property('password').eq('Password is required.')
    })

    it('Invalid user data (long username & short password).', async () => {
      const userData = { username: 'ridiculously long username', password: '1234' }
      const response = await chai.request(server).post('/api/users').send(userData)

      response.should.have.status(400)
      response.body.should.be.a('object')
      response.body.should.have.property('username').eq('Username must be at least 6 and at most 20 characters long.')
      response.body.should.have.property('password').eq('Password must be at least 6 and at most 20 characters long.')
    })

    it('Valid user data.', async () => {
      const userData = { username: 'qwerty', password: 'password' }
      const response = await chai.request(server).post('/api/users').send(userData)

      response.should.have.status(201)
      response.body.should.be.a('string')

      const userId = response.body
      const qwerty = await User.findById(userId)
      qwerty.username.should.be.eq(userData.username)
      qwerty.password.should.be.eq(userData.password)
    })
  })

  describe('GET: /api/users - Get all users.', () => {
    after(() => {
      return dbConnection.db.dropCollection('users')
    })

    it('Has registered user.', async () => {
      await User.insertMany([
        { username: 'qwerty-1', password: 'password' },
        { username: 'qwerty-2', password: 'password' },
        { username: 'qwerty-3', password: 'password' },
      ])

      const users = await User.find({})
      const userDtos = users.map(({ _id, username }) => ({ id: _id.toString(), username, likes: 0 }))

      const response = await chai.request(server).get('/api/users')

      response.should.have.status(200)
      response.body.should.be.a('array')
      response.body.should.deep.include.members(userDtos)
    })
  })

  describe('GET: /api/users/{id} - Get specific user.', () => {
    after(() => {
      return dbConnection.db.dropCollection('users')
    })

    it('Invalid user id.', async () => {
      const response = await chai.request(server).get('/api/users/invalid_user_id')

      response.should.have.status(400)
      response.body.should.be.a('object')
      response.body.should.have.property('id').eq('Invalid user id.')
    })

    it('Try get non-existing user.', async () => {
      const response = await chai.request(server).get('/api/users/000000000000000000000000')
      response.should.have.status(404)
    })

    it('Get existing user.', async () => {
      const qwerty = new User({ username: 'qwerty', password: 'password' })
      await qwerty.save()

      const response = await chai.request(server).get(`/api/users/${qwerty._id.toString()}`)

      response.should.have.status(200)
      response.body.should.be.a('object')
      response.body.should.have.property('id').eq(qwerty._id.toString())
      response.body.should.have.property('username').eq(qwerty.username)
      response.body.should.have.property('likes').eq(0)
    })
  })

  describe('PUT: /api/users/{id} - Update specific user.', () => {
    let qwerty
    let token

    before(async () => {
      qwerty = new User({ username: 'qwerty', password: 'password' })
      await qwerty.save()

      token = sign({ sub: qwerty._id.toString() }, process.env.TOKEN_SECRET)
    })
    after(() => {
      return dbConnection.db.dropCollection('users')
    })

    it('Invalid user id.', async () => {
      const response = await chai
        .request(server)
        .put('/api/users/invalid_user_id')
        .set('Authorization', `Bearer ${token}`)

      response.should.have.status(400)
      response.body.should.be.a('object')
      response.body.should.have.property('id').eq('Invalid user id.')
    })

    it('No user data.', async () => {
      const response = await chai
        .request(server)
        .put(`/api/users/${qwerty._id.toString()}`)
        .set('Authorization', `Bearer ${token}`)
        .send({})

      response.should.have.status(400)
      response.body.should.be.a('object')
      response.body.should.have.property('username').eq('Username is required.')
      response.body.should.have.property('password').eq('Password is required.')
    })

    it('Invalid user data (long username & short password).', async () => {
      const response = await chai
        .request(server)
        .put(`/api/users/${qwerty._id.toString()}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ username: 'ridiculously long username', password: '1234' })

      response.should.have.status(400)
      response.body.should.be.a('object')
      response.body.should.have.property('username').eq('Username must be at least 6 and at most 20 characters long.')
      response.body.should.have.property('password').eq('Password must be at least 6 and at most 20 characters long.')
    })

    it('Valid user data.', async () => {
      const updatedUserData = { username: `${qwerty.username} (upd)`, password: `${qwerty.password} (upd)` }
      const response = await chai
        .request(server)
        .put(`/api/users/${qwerty._id.toString()}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedUserData)

      const updatedQwerty = await User.findById(qwerty._id)

      response.should.have.status(200)
      updatedQwerty.should.have.property('username').eq(updatedUserData.username)
      updatedQwerty.should.have.property('password').eq(updatedUserData.password)
    })
  })

  describe('DELETE: /api/users/{id} - Delete specific user.', () => {
    let qwerty
    let token

    before(async () => {
      qwerty = new User({ username: 'qwerty', password: 'password' })
      await qwerty.save()

      token = sign({ sub: qwerty._id.toString() }, process.env.TOKEN_SECRET)
    })
    after(() => {
      return dbConnection.db.dropCollection('users')
    })

    it('Invalid user id.', async () => {
      const response = await chai
        .request(server)
        .delete('/api/users/invalid_user_id')
        .set('Authorization', `Bearer ${token}`)

      response.should.have.status(400)
      response.body.should.be.a('object')
      response.body.should.have.property('id').eq('Invalid user id.')
    })

    it('Try delete non-existing user.', async () => {
      const response = await chai
        .request(server)
        .delete('/api/users/000000000000000000000000')
        .set('Authorization', `Bearer ${token}`)

      response.should.have.status(404)
    })

    it('Delete existing user.', async () => {
      const response = await chai
        .request(server)
        .delete(`/api/users/${qwerty._id.toString(0)}`)
        .set('Authorization', `Bearer ${token}`)

      response.should.have.status(200)

      const qwertyCount = await User.countDocuments({ _id: qwerty._id })
      qwertyCount.should.be.eq(0)
    })
  })
})
