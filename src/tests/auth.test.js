const chai = require('chai')
const chaiHttp = require('chai-http')
const { sign, verify } = require('jsonwebtoken')

const { User } = require('../models')
const serverPromise = require('../server')

chai.should()
chai.use(chaiHttp)

describe('Authentication & Authorization', () => {
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

  describe('POST: /api/auth/token - Generate authorization token for specified user credentials.', () => {
    let qwerty

    before(() => {
      qwerty = new User({ username: 'qwerty', password: 'password' })
      return qwerty.save()
    })
    after(() => {
      return dbConnection.db.dropCollection('users')
    })

    it('Invalid username.', async () => {
      const response = await chai
        .request(server)
        .post('/api/auth/token')
        .send({ username: 'non-existing', password: qwerty.password })

      response.should.have.status(400)
      response.body.should.be.a('object')
      response.body.should.have.property('username').eq('User with such username does not exist.')
    })

    it('Invalid password.', async () => {
      const response = await chai
        .request(server)
        .post('/api/auth/token')
        .send({ username: qwerty.username, password: 'incorrect' })

      response.should.have.status(400)
      response.body.should.be.a('object')
      response.body.should.have.property('password').eq('Incorrect password provided.')
    })

    it('Valid credentials.', async () => {
      const response = await chai
        .request(server)
        .post('/api/auth/token')
        .send({ username: qwerty.username, password: qwerty.password })

      response.should.have.status(200)
      response.body.should.be.a('string')

      const payload = verify(response.body, process.env.TOKEN_SECRET)
      payload.should.be.a('object')
      payload.should.have.property('sub').eq(qwerty._id.toString())
    })
  })

  describe('GET: /api/auth/me - Get current user info.', () => {
    after(() => {
      return dbConnection.db.dropCollection('users')
    })

    it('No authorization token.', async () => {
      const response = await chai.request(server).get('/api/auth/me')
      response.should.have.status(401)
    })

    it('Invalid authorization token - token in not parsable.', async () => {
      const response = await chai.request(server).get('/api/auth/me').set('Authorization', 'Bearer invalid.auth.token')
      response.should.have.status(401)
    })

    it('Invalid authorization token - token owner does not exist.', async () => {
      const token = sign({ sub: '000000000000000000000000' }, process.env.TOKEN_SECRET)
      const response = await chai.request(server).get('/api/auth/me').set('Authorization', `Bearer ${token}`)

      response.should.have.status(401)
    })

    it('Valid auth token.', async () => {
      const qwerty = new User({ username: 'qwerty', password: 'password' })
      await qwerty.save()

      const token = sign({ sub: qwerty._id.toString() }, process.env.TOKEN_SECRET)
      const response = await chai.request(server).get('/api/auth/me').set('Authorization', `Bearer ${token}`)

      response.should.have.status(200)
      response.body.should.be.a('object')
      response.body.should.have.property('id').eq(qwerty._id.toString())
      response.body.should.have.property('username').eq(qwerty.username)
      response.body.should.not.have.property('headline')
      response.body.should.have.property('likes').eq(0)
    })
  })
})
