const chai = require('chai')
const chaiHttp = require('chai-http')
const { sign, verify } = require('jsonwebtoken')

const { User } = require('../models')
const serverPromise = require('../server')

chai.should()
chai.use(chaiHttp)

describe('Authentication & Authorization', () => {
  let server
  let user
  before((done) => {
    serverPromise
      .then(({ app, db }) => {
        server = app
        return db.dropDatabase()
      })
      .then(() => {
        user = new User({ username: 'qwerty', password: 'password' })
        return user.save()
      })
      .then(() => {
        done()
      })
  })

  describe('POST: /api/auth/token - Generate authorization token for specified user credentials.', () => {
    it('Invalid username.', (done) => {
      chai
        .request(server)
        .post('/api/auth/token')
        .send({ username: 'non-existing', password: user.password })
        .end((_, response) => {
          response.should.have.status(400)

          response.body.should.be.a('object')
          response.body.should.have.property('username').eq('User with such username does not exist.')

          done()
        })
    })

    it('Invalid password.', (done) => {
      chai
        .request(server)
        .post('/api/auth/token')
        .send({ username: user.username, password: 'incorrect' })
        .end((_, response) => {
          response.should.have.status(400)

          response.body.should.be.a('object')
          response.body.should.have.property('password').eq('Incorrect password provided.')

          done()
        })
    })

    it('Valid credentials.', (done) => {
      chai
        .request(server)
        .post('/api/auth/token')
        .send({ username: user.username, password: user.password })
        .end((_, response) => {
          response.should.have.status(200)

          response.body.should.be.a('string')

          const token = response.body
          const payload = verify(token, process.env.TOKEN_SECRET)
          payload.should.be.a('object')
          payload.should.have.property('sub').eq(user._id.toString())

          done()
        })
    })
  })

  describe('GET: /api/auth/me - Get current user info.', () => {
    const token = (id) => sign({ sub: id }, process.env.TOKEN_SECRET)

    it('No authorization token.', (done) => {
      chai
        .request(server)
        .get('/api/auth/me')
        .end((_, response) => {
          response.should.have.status(401)
          done()
        })
    })

    it('Invalid authorization token - token in not parsable.', (done) => {
      chai
        .request(server)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.auth.token')
        .end((_, response) => {
          response.should.have.status(401)
          done()
        })
    })

    it('Invalid authorization token - token owner does not exist.', (done) => {
      chai
        .request(server)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token('000000000000000000000000')}`)
        .end((_, response) => {
          response.should.have.status(401)
          done()
        })
    })

    it('Valid auth token.', (done) => {
      chai
        .request(server)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token(user._id.toString())}`)
        .end((_, response) => {
          response.should.have.status(200)

          response.body.should.be.a('object')
          response.body.should.have.property('id').eq(user._id.toString())
          response.body.should.have.property('username').eq(user.username)

          done()
        })
    })
  })
})
