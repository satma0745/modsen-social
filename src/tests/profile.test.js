const chai = require('chai')
const chaiHttp = require('chai-http')
const { sign } = require('jsonwebtoken')

const serverPromise = require('../server')
const { User } = require('../models')

chai.should()
chai.use(chaiHttp)

describe('User profile', () => {
  const token = (id) => sign({ sub: id }, process.env.TOKEN_SECRET)

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

  describe("GET: /api/users/{userId}/profile - Get user's profile.", () => {
    it('Incorrect user id.', (done) => {
      chai
        .request(server)
        .get('/api/users/invalid/profile')
        .end((_, response) => {
          response.should.have.status(400)

          response.body.should.be.a('object')
          response.body.should.have.property('userId').eq('Invalid user id.')

          done()
        })
    })

    it("Try get non-existing user's profile.", (done) => {
      chai
        .request(server)
        .get('/api/users/000000000000000000000000/profile')
        .end((_, response) => {
          response.should.have.status(404)
          done()
        })
    })

    it("Get existing user's profile.", (done) => {
      new User({
        username: 'get-user-profile',
        password: 'password',
        profile: {
          headline: 'headline',
          bio: 'bio',
          contacts: [{ type: 'contact type', value: 'contact value' }],
        },
      })
        .save()
        .then(($user) => {
          chai
            .request(server)
            .get(`/api/users/${$user._id.toString()}/profile`)
            .end((_, response) => {
              response.should.have.status(200)

              response.body.should.be.a('object')
              response.body.should.have.property('headline').eq('headline')
              response.body.should.have.property('bio').eq('bio')
              response.body.should.have.property('contacts')
              response.body.contacts.should.be.a('array')
              response.body.contacts
                .map(({ type, value }) => ({ type, value }))
                .should.deep.include.members([{ type: 'contact type', value: 'contact value' }])

              done()
            })
        })
    })
  })

  describe('PUT: /api/users/{userId}/profile - Update user profile.', () => {
    it('Invalid data.', (done) => {
      chai
        .request(server)
        .put(`/api/users/invalid/profile`)
        .set('Authorization', `Bearer ${token(user._id.toString())}`)
        .send({
          headline: '0123456789'.repeat(11),
          bio: '0123456789'.repeat(401),
          contacts: [
            {
              type: '0123456789'.repeat(3),
              value: '0123456789',
            },
          ],
        })
        .end((_, response) => {
          response.should.have.status(400)

          response.body.should.be.a('object')
          response.body.should.have.property('userId').eq('Invalid user id.')
          response.body.should.have.property('headline').eq('Profile headline cannot exceed 100 characters.')
          response.body.should.have.property('bio').eq('Bio cannot exceed 4000 characters.')
          response.body.should.have.property('contacts').eq('Contact record type cannot exceed 20 characters.')

          done()
        })
    })

    it('Valid data.', (done) => {
      chai
        .request(server)
        .put(`/api/users/${user._id.toString()}/profile`)
        .set('Authorization', `Bearer ${token(user._id.toString())}`)
        .send({
          headline: 'headline',
          bio: 'bio',
          contacts: [
            {
              type: 'contact type',
              value: 'contact value',
            },
          ],
        })
        .end((_, response) => {
          response.should.have.status(200)

          // check if saved correctly
          User.findById(user.id).then((owner) => {
            const { profile } = owner

            profile.should.have.property('headline').eq('headline')
            profile.should.have.property('bio').eq('bio')

            profile.contacts
              .map(({ type, value }) => ({ type, value }))
              .should.deep.include.members([
                {
                  type: 'contact type',
                  value: 'contact value',
                },
              ])

            done()
          })
        })
    })
  })

  describe("POST: /api/users/{userId}/profile/like - Like user's profile.", () => {
    it('Incorrect user id.', (done) => {
      chai
        .request(server)
        .post('/api/users/invalid/profile/like')
        .set('Authorization', `Bearer ${token(user._id.toString())}`)
        .end((_, response) => {
          response.should.have.status(400)

          response.body.should.be.a('object')
          response.body.should.have.property('userId').eq('Invalid user id.')

          done()
        })
    })

    it("Try like non-existing user's profile.", (done) => {
      chai
        .request(server)
        .post('/api/users/000000000000000000000000/profile/like')
        .set('Authorization', `Bearer ${token(user._id.toString())}`)
        .end((_, response) => {
          response.should.have.status(404)
          done()
        })
    })

    it("Like existing user's profile.", (done) => {
      new User({
        username: 'like-user-profile',
        password: 'password',
        profile: {
          headline: 'headline',
          bio: 'bio',
          contacts: [{ type: 'contact type', value: 'contact value' }],
        },
      })
        .save()
        .then(({ _id: id }) => {
          chai
            .request(server)
            .post(`/api/users/${id.toString()}/profile/like`)
            .set('Authorization', `Bearer ${token(user._id.toString())}`)
            .end((_, response) => {
              response.should.have.status(200)

              User.findById(id).then(({ profile }) => {
                const likedBy = profile.likedBy.map((objectId) => objectId.toString())
                likedBy.should.include(user._id.toString())
                done()
              })
            })
        })
    })
  })

  describe("POST: /api/users/{userId}/profile/unlike - Unlike user's profile.", () => {
    it('Incorrect user id.', (done) => {
      chai
        .request(server)
        .post('/api/users/invalid/profile/unlike')
        .set('Authorization', `Bearer ${token(user._id.toString())}`)
        .end((_, response) => {
          response.should.have.status(400)

          response.body.should.be.a('object')
          response.body.should.have.property('userId').eq('Invalid user id.')

          done()
        })
    })

    it("Try unlike non-existing user's profile.", (done) => {
      chai
        .request(server)
        .post('/api/users/000000000000000000000000/profile/unlike')
        .set('Authorization', `Bearer ${token(user._id.toString())}`)
        .end((_, response) => {
          response.should.have.status(404)
          done()
        })
    })

    it("Unlike existing user's profile.", (done) => {
      const favorite = new User({
        username: 'unlike-user-profile',
        password: 'password',
        profile: {
          headline: 'headline',
          bio: 'bio',
          contacts: [{ type: 'contact type', value: 'contact value' }],
          likedBy: [user._id],
        },
      })

      user.profile.liked.push(favorite._id)

      Promise.all([favorite.save(), user.save()]).then(() => {
        chai
          .request(server)
          .post(`/api/users/${favorite._id.toString()}/profile/unlike`)
          .set('Authorization', `Bearer ${token(user._id.toString())}`)
          .end((_, response) => {
            response.should.have.status(200)

            User.findById(favorite._id).then(({ profile }) => {
              const likedBy = profile.likedBy.map((objectId) => objectId.toString())
              likedBy.should.not.include(user._id.toString())
              done()
            })
          })
      })
    })
  })
})
