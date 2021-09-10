const chai = require('chai')
const chaiHttp = require('chai-http')
const { ObjectId } = require('mongoose').Types
const { sign, verify } = require('jsonwebtoken')

const { User, RefreshTokens } = require('../models')
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

  describe('POST: /api/auth/token - Generate token pair for specified user credentials.', () => {
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

      // received both access and refresh tokens
      response.should.have.status(200)
      response.body.should.be.an('object')
      response.body.should.have.property('access').that.is.a('string')
      response.body.should.have.property('refresh').that.is.a('string')

      const { access: accessToken, refresh: refreshToken } = response.body
      const accessTokenPayload = verify(accessToken, process.env.TOKEN_SECRET)
      const refreshTokenPayload = verify(refreshToken, process.env.TOKEN_SECRET)

      // access token should contain user id
      accessTokenPayload.should.be.a('object')
      accessTokenPayload.should.have.property('sub').eq(qwerty._id.toString())

      // refresh token should contain user id & token id
      refreshTokenPayload.should.be.an('object')
      refreshTokenPayload.should.have.property('sub').that.is.an('array')
      refreshTokenPayload.sub.should.have.length(2)
      refreshTokenPayload.sub[0].should.be.eq(qwerty._id.toString())
      refreshTokenPayload.sub[1].should.be.a('string')

      // id of the issued refresh token should be saved to the database
      const userRefreshTokens = await RefreshTokens.findByUserId(qwerty._id)
      const issuedRefreshTokens = userRefreshTokens.tokens
      issuedRefreshTokens.should.have.length(1)
      issuedRefreshTokens.map((tokenId) => tokenId.toString()).should.include(refreshTokenPayload.sub[1])
    })
  })

  describe('POST: /api/auth/refresh - Refresh token pair.', () => {
    let qwerty

    before(() => {
      qwerty = new User({ username: 'qwerty', password: 'password' })
      return qwerty.save()
    })
    after(() => {
      return dbConnection.db.dropCollection('users')
    })

    it('Try refresh without a token.', async () => {
      const response = await chai.request(server).post('/api/auth/refresh').send()

      response.should.have.status(400)
      response.should.have.property('body').that.is.an('object')
      response.body.should.have.property('refresh').eq('Refresh token is required.')
    })

    it('Try refresh using malformed token.', async () => {
      const refreshToken = sign({ malformed: true }, process.env.TOKEN_SECRET)
      const response = await chai.request(server).post('/api/auth/refresh').send({ refresh: refreshToken })

      response.should.have.status(401)
      response.should.have.property('body').that.is.an('object')
      response.body.should.have.property('refresh').eq(true)
    })

    it('Try refresh using token with non-existing owner.', async () => {
      const userId = '000000000000000000000000'
      const tokenId = '000000000000000000000000'
      const refreshToken = sign({ sub: [userId, tokenId] }, process.env.TOKEN_SECRET)

      const response = await chai.request(server).post('/api/auth/refresh').send({ refresh: refreshToken })

      response.should.have.status(401)
      response.should.have.property('body').that.is.an('object')
      response.body.should.have.property('refresh').eq(true)
    })

    it('Try refresh using revoked token.', async () => {
      const userId = qwerty._id.toString()
      const tokenId = '000000000000000000000000'
      const refreshToken = sign({ sub: [userId, tokenId] }, process.env.TOKEN_SECRET)

      const response = await chai.request(server).post('/api/auth/refresh').send({ refresh: refreshToken })

      response.should.have.status(401)
      response.should.have.property('body').that.is.an('object')
      response.body.should.have.property('refresh').eq(true)
    })

    it('Try refresh using expired token.', async () => {
      const userId = qwerty._id.toString()
      const tokenId = '000000000000000000000000'
      const refreshToken = sign({ sub: [userId, tokenId] }, process.env.TOKEN_SECRET, { expiresIn: '-1s' })

      const response = await chai.request(server).post('/api/auth/refresh').send({ refresh: refreshToken })

      response.should.have.status(401)
      response.should.have.property('body').that.is.an('object')
      response.body.should.have.property('refresh').eq(true)
    })

    it('Refresh using legitimate token.', async () => {
      const refreshTokenId = new ObjectId()

      // register refresh token
      let qwertyRefreshTokens = new RefreshTokens({ _id: qwerty._id })
      qwertyRefreshTokens.tokens.push(refreshTokenId)
      await qwertyRefreshTokens.save()

      // create refresh token
      const userId = qwerty._id.toString()
      const tokenId = refreshTokenId.toString()
      const refreshToken = sign({ sub: [userId, tokenId] }, process.env.TOKEN_SECRET)

      const response = await chai.request(server).post('/api/auth/refresh').send({ refresh: refreshToken })

      response.should.have.status(200)
      response.should.have.property('body').that.is.an('object')
      response.body.should.have.property('access').that.is.a('string')
      response.body.should.have.property('refresh').that.is.a('string')

      // new access token should contain user id
      const newAccessToken = response.body.access
      const accessTokenPayload = verify(newAccessToken, process.env.TOKEN_SECRET)
      accessTokenPayload.should.have.property('sub').eq(userId)

      // new refresh token should contain both user id & token id
      const newRefreshToken = response.body.refresh
      const refreshTokenPayload = verify(newRefreshToken, process.env.TOKEN_SECRET)
      refreshTokenPayload.should.have.property('sub').that.is.an('array')
      refreshTokenPayload.sub.should.have.length(2)
      refreshTokenPayload.sub[0].should.be.eq(userId)
      refreshTokenPayload.sub[1].should.be.a('string')

      // id of the issued refresh token should be saved to the database
      qwertyRefreshTokens = await RefreshTokens.findByUserId(qwerty._id)
      const issuedRefreshTokens = qwertyRefreshTokens.tokens
      issuedRefreshTokens.should.have.length(1)
      issuedRefreshTokens.map((id) => id.toString()).should.include(refreshTokenPayload.sub[1])
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
