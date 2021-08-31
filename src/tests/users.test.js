const chai = require('chai')
const chaiHttp = require('chai-http')
const { sign } = require('jsonwebtoken')

const startAsync = require('../server')

chai.should()
chai.use(chaiHttp)

describe('User CRUD', () => {
  let server
  before((done) => {
    startAsync()
      .then(({ app, db }) => {
        db.dropDatabase()
        server = app
        done()
      })
      .catch(() => {
        done()
      })
  })

  const testUser = { username: 'test0745', password: 'password' }
  const token = () => sign({ sub: testUser.id }, process.env.TOKEN_SECRET)

  describe('POST: /api/users - Register a new user.', () => {
    it('No user data.', (done) => {
      chai
        .request(server)
        .post('/api/users')
        .send({})
        .end((_, response) => {
          response.should.have.status(400)

          response.body.should.be.a('object')
          response.body.should.have.property('username').eq('Username is required.')
          response.body.should.have.property('password').eq('Password is required.')

          done()
        })
    })

    it('Invalid user data (long username & short password).', (done) => {
      chai
        .request(server)
        .post('/api/users')
        .send({ username: 'ridiculously long username', password: '1234' })
        .end((_, response) => {
          response.should.have.status(400)

          response.body.should.be.a('object')
          response.body.should.have
            .property('username')
            .eq('Username must be at least 6 and at most 20 characters long.')
          response.body.should.have
            .property('password')
            .eq('Password must be at least 6 and at most 20 characters long.')

          done()
        })
    })

    it('Valid user data.', (done) => {
      chai
        .request(server)
        .post('/api/users')
        .send(testUser)
        .end((_, response) => {
          response.should.have.status(201)

          response.body.should.be.a('string')
          testUser.id = response.body

          done()
        })
    })
  })

  describe('GET: /api/users - Get all users.', () => {
    it('Has registered user.', (done) => {
      chai
        .request(server)
        .get('/api/users')
        .end((_, response) => {
          response.should.have.status(200)

          response.body.should.be.a('array')
          response.body.should.deep.include.members([
            {
              id: testUser.id,
              username: testUser.username,
              likes: 0,
            },
          ])

          done()
        })
    })
  })

  describe('GET: /api/users/{id} - Get specific user.', () => {
    it('Invalid user id.', (done) => {
      chai
        .request(server)
        .get('/api/users/invalid_user_id')
        .end((_, response) => {
          response.should.have.status(400)

          response.body.should.be.a('object')
          response.body.should.have.property('id').eq('Invalid user id.')

          done()
        })
    })

    it('Try get non-existing user.', (done) => {
      chai
        .request(server)
        .get('/api/users/000000000000000000000000')
        .end((_, response) => {
          response.should.have.status(404)
          done()
        })
    })

    it('Get existing user.', (done) => {
      chai
        .request(server)
        .get(`/api/users/${testUser.id}`)
        .end((_, response) => {
          response.should.have.status(200)

          response.body.should.be.a('object')
          response.body.should.have.property('id').eq(testUser.id)
          response.body.should.have.property('username').eq(testUser.username)
          response.body.should.have.property('likes').eq(0)

          done()
        })
    })
  })

  describe('PUT: /api/users/{id} - Update specific user.', () => {
    it('Invalid user id.', (done) => {
      chai
        .request(server)
        .put('/api/users/invalid_user_id')
        .set('Authorization', `Bearer ${token()}`)
        .end((_, response) => {
          response.should.have.status(400)

          response.body.should.be.a('object')
          response.body.should.have.property('id').eq('Invalid user id.')

          done()
        })
    })

    it('No user data.', (done) => {
      chai
        .request(server)
        .put(`/api/users/${testUser.id}`)
        .set('Authorization', `Bearer ${token()}`)
        .send({})
        .end((_, response) => {
          response.should.have.status(400)

          response.body.should.be.a('object')
          response.body.should.have.property('username').eq('Username is required.')
          response.body.should.have.property('password').eq('Password is required.')

          done()
        })
    })

    it('Invalid user data (long username & short password).', (done) => {
      chai
        .request(server)
        .put(`/api/users/${testUser.id}`)
        .set('Authorization', `Bearer ${token()}`)
        .send({ username: 'ridiculously long username', password: '1234' })
        .end((_, response) => {
          response.should.have.status(400)

          response.body.should.be.a('object')
          response.body.should.have
            .property('username')
            .eq('Username must be at least 6 and at most 20 characters long.')
          response.body.should.have
            .property('password')
            .eq('Password must be at least 6 and at most 20 characters long.')

          done()
        })
    })

    it('Valid user data.', (done) => {
      chai
        .request(server)
        .put(`/api/users/${testUser.id}`)
        .set('Authorization', `Bearer ${token()}`)
        .send({ username: `${testUser.username} (upd)`, password: testUser.password })
        .end((_updateErr, updateResponse) => {
          updateResponse.should.have.status(200)

          chai
            .request(server)
            .get(`/api/users/${testUser.id}`)
            .end((_getErr, getResponse) => {
              getResponse.should.have.status(200)

              getResponse.body.should.be.a('object')
              getResponse.body.should.have.property('id').eq(testUser.id)
              getResponse.body.should.have.property('username').eq(`${testUser.username} (upd)`)
              getResponse.body.should.have.property('likes').eq(0)

              done()
            })
        })
    })
  })

  describe('DELETE: /api/users/{id} - Delete specific user.', () => {
    it('Invalid user id.', (done) => {
      chai
        .request(server)
        .delete('/api/users/invalid_user_id')
        .set('Authorization', `Bearer ${token()}`)
        .end((_, response) => {
          response.should.have.status(400)

          response.body.should.be.a('object')
          response.body.should.have.property('id').eq('Invalid user id.')

          done()
        })
    })

    it('Try delete non-existing user.', (done) => {
      chai
        .request(server)
        .delete('/api/users/000000000000000000000000')
        .set('Authorization', `Bearer ${token()}`)
        .end((_, response) => {
          response.should.have.status(404)
          done()
        })
    })

    it('Delete existing user.', (done) => {
      chai
        .request(server)
        .delete(`/api/users/${testUser.id}`)
        .set('Authorization', `Bearer ${token()}`)
        .end((_, response) => {
          response.should.have.status(200)
          done()
        })
    })
  })
})
