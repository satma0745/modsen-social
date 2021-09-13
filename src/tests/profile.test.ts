import chai from 'chai'
import chaiHttp from 'chai-http'
import { sign } from 'jsonwebtoken'

import serverPromise from '../server'
import { User } from '../models'

chai.should()
chai.use(chaiHttp)

describe('User profile', () => {
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

  describe("GET: /api/users/{userId}/profile - Get user's profile.", () => {
    after(() => {
      return dbConnection.db.dropCollection('users')
    })

    it('Incorrect user id.', async () => {
      const response = await chai.request(server).get('/api/users/invalid/profile')

      response.should.have.status(400)
      response.body.should.be.a('object')
      response.body.should.have.property('userId').eq('Invalid user id.')
    })

    it("Try get non-existing user's profile.", async () => {
      const response = await chai.request(server).get('/api/users/000000000000000000000000/profile')
      response.should.have.status(404)
    })

    it("Get existing user's profile.", async () => {
      const qwerty = new User({
        username: 'qwerty',
        password: 'password',
        profile: {
          headline: 'headline',
          bio: 'bio',
          contacts: [
            { type: 'phone number', value: '+xxx (xxx) xxx-xx-xx' },
            { type: 'telegram', value: 't.me/qwerty' },
          ],
        },
      })
      await qwerty.save()

      const response = await chai.request(server).get(`/api/users/${qwerty._id.toString()}/profile`)

      response.should.have.status(200)
      response.body.should.be.a('object')
      response.body.should.have.property('headline').eq(qwerty.profile.headline)
      response.body.should.have.property('bio').eq(qwerty.profile.bio)
      response.body.should.have.property('contacts').that.is.a('array')
      response.body.contacts.should.deep.include.members(
        qwerty.profile.contacts.map(({ type, value }) => ({ type, value }))
      )
    })
  })

  describe('PUT: /api/users/{userId}/profile - Update user profile.', () => {
    let qwerty
    let token

    before(async () => {
      qwerty = new User({ username: 'qwerty', password: 'username' })
      await qwerty.save()

      token = sign({ sub: qwerty._id.toString() }, process.env.TOKEN_SECRET)
    })
    after(() => {
      return dbConnection.db.dropCollection('users')
    })

    it('Invalid data.', async () => {
      const invalidUpdateProfileData = {
        headline: '0123456789'.repeat(11),
        bio: '0123456789'.repeat(401),
        contacts: [{ type: '0123456789'.repeat(3), value: '0123456789' }],
      }

      const response = await chai
        .request(server)
        .put(`/api/users/invalid/profile`)
        .set('Authorization', `Bearer ${token}`)
        .send(invalidUpdateProfileData)

      response.should.have.status(400)
      response.body.should.be.a('object')
      response.body.should.have.property('userId').eq('Invalid user id.')
      response.body.should.have.property('headline').eq('Profile headline cannot exceed 100 characters.')
      response.body.should.have.property('bio').eq('Bio cannot exceed 4000 characters.')
      response.body.should.have.property('contacts').eq('Contact record type cannot exceed 20 characters.')
    })

    it('Valid data.', async () => {
      const profileData = {
        headline: 'headline',
        bio: 'bio',
        contacts: [{ type: 'contact type', value: 'contact value' }],
      }

      const response = await chai
        .request(server)
        .put(`/api/users/${qwerty._id.toString()}/profile`)
        .set('Authorization', `Bearer ${token}`)
        .send(profileData)

      // get updated document
      qwerty = await User.findById(qwerty._id)

      response.should.have.status(200)

      qwerty.profile.should.have.property('headline').eq(profileData.headline)
      qwerty.profile.should.have.property('bio').eq(profileData.bio)
      qwerty.profile.contacts
        .map(({ type, value }) => ({ type, value }))
        .should.deep.include.members(profileData.contacts)
    })
  })

  describe("POST: /api/users/{userId}/profile/like - Like user's profile.", () => {
    let favorite
    let fan
    let fansToken

    before(async () => {
      favorite = new User({ username: 'favorite', password: 'password' })
      fan = new User({ username: 'test-fan', password: 'password' })

      await Promise.all([favorite.save(), fan.save()])

      fansToken = sign({ sub: fan._id.toString() }, process.env.TOKEN_SECRET)
    })
    after(() => {
      return dbConnection.db.dropCollection('users')
    })

    it('Incorrect user id.', async () => {
      const response = await chai
        .request(server)
        .post('/api/users/invalid/profile/like')
        .set('Authorization', `Bearer ${fansToken}`)

      response.should.have.status(400)
      response.body.should.be.a('object')
      response.body.should.have.property('userId').eq('Invalid user id.')
    })

    it("Try like non-existing user's profile.", async () => {
      const response = await chai
        .request(server)
        .post('/api/users/000000000000000000000000/profile/like')
        .set('Authorization', `Bearer ${fansToken}`)

      response.should.have.status(404)
    })

    it("Like existing user's profile.", async () => {
      const response = await chai
        .request(server)
        .post(`/api/users/${favorite._id.toString()}/profile/like`)
        .set('Authorization', `Bearer ${fansToken}`)

      // get updated documents
      fan = await User.findById(fan._id)
      favorite = await User.findById(favorite._id)

      response.should.have.status(200)

      fan.profile.liked.map((id) => id.toString()).should.include(favorite._id.toString())
      favorite.profile.likedBy.map((id) => id.toString()).should.include(fan._id.toString())
    })
  })

  describe("POST: /api/users/{userId}/profile/unlike - Unlike user's profile.", () => {
    let favorite
    let fan
    let fansToken

    before(async () => {
      favorite = new User({ username: 'favorite', password: 'password' })
      fan = new User({ username: 'test-fan', password: 'password' })

      favorite.profile.likedBy.push(fan._id)
      fan.profile.liked.push(favorite._id)

      await Promise.all([favorite.save(), fan.save()])

      fansToken = sign({ sub: fan._id.toString() }, process.env.TOKEN_SECRET)
    })
    after(() => {
      return dbConnection.db.dropCollection('users')
    })

    it('Incorrect user id.', async () => {
      const response = await chai
        .request(server)
        .post('/api/users/invalid/profile/unlike')
        .set('Authorization', `Bearer ${fansToken}`)

      response.should.have.status(400)
      response.body.should.be.a('object')
      response.body.should.have.property('userId').eq('Invalid user id.')
    })

    it("Try unlike non-existing user's profile.", async () => {
      const response = await chai
        .request(server)
        .post('/api/users/000000000000000000000000/profile/unlike')
        .set('Authorization', `Bearer ${fansToken}`)

      response.should.have.status(404)
    })

    it("Unlike existing user's profile.", async () => {
      const response = await chai
        .request(server)
        .post(`/api/users/${favorite._id.toString()}/profile/unlike`)
        .set('Authorization', `Bearer ${fansToken}`)

      // get updated documents
      fan = await User.findById(fan._id)
      favorite = await User.findById(favorite._id)

      response.should.have.status(200)

      favorite.profile.likedBy.map((id) => id.toString()).should.not.include(fan._id.toString())
      fan.profile.liked.map((id) => id.toString()).should.not.include(favorite._id.toString())
    })
  })

  describe("GET: /api/users/{userId}/profile/fans - Get user profile's fans.", () => {
    let favorite
    let fans

    before(() => {
      favorite = new User({ username: 'favorite', password: 'password' })
      fans = [
        new User({ username: 'fan-of-favorite-1', password: 'password' }),
        new User({ username: 'fan-of-favorite-2', password: 'password' }),
        new User({ username: 'fan-of-favorite-3', password: 'password' }),
      ]

      fans.forEach((fan) => {
        favorite.profile.likedBy.push(fan._id)
        fan.profile.liked.push(favorite._id)
      })

      return Promise.all([
        favorite.save(),
        ...fans.map((fan) => {
          return fan.save()
        }),
      ])
    })
    after(() => {
      return dbConnection.db.dropCollection('users')
    })

    it('Invalid id.', async () => {
      const response = await chai.request(server).get('/api/users/invalid/profile/fans')

      response.should.have.status(400)
      response.body.should.be.a('object')
      response.body.should.have.property('userId').eq('Invalid user id.')
    })

    it('Try to get fans of non-existing user.', async () => {
      const response = await chai.request(server).get('/api/users/000000000000000000000000/profile/fans')
      response.should.have.status(404)
    })

    it('Get fans.', async () => {
      const response = await chai.request(server).get(`/api/users/${favorite._id.toString()}/profile/fans`)

      response.should.have.status(200)
      response.body.should.be.a('array')
      response.body.should.deep.include.members(
        fans.map(({ _id, username, profile: { likedBy } }) => ({
          id: _id.toString(),
          username,
          likes: likedBy.length,
        }))
      )
    })
  })

  describe("GET: /api/users/{userId}/profile/favorites - Get user's favorites.", () => {
    let fan
    let favorites

    before(() => {
      fan = new User({ username: 'test-fan', password: 'password' })
      favorites = [
        new User({ username: 'favorite-1', password: 'password' }),
        new User({ username: 'favorite-2', password: 'password' }),
        new User({ username: 'favorite-3', password: 'password' }),
      ]

      favorites.forEach((favorite) => {
        favorite.profile.likedBy.push(fan._id)
        fan.profile.liked.push(favorite._id)
      })

      return Promise.all([
        fan.save(),
        ...favorites.map((favorite) => {
          return favorite.save()
        }),
      ])
    })
    after(() => {
      return dbConnection.db.dropCollection('users')
    })

    it('Invalid id.', async () => {
      const response = await chai.request(server).get('/api/users/invalid/profile/favorites')

      response.should.have.status(400)
      response.body.should.be.a('object')
      response.body.should.have.property('userId').eq('Invalid user id.')
    })

    it('Try to get favorites of non-existing user.', async () => {
      const response = await chai.request(server).get('/api/users/000000000000000000000000/profile/favorites')
      response.should.have.status(404)
    })

    it('Get favorites.', async () => {
      const response = await chai.request(server).get(`/api/users/${fan._id.toString()}/profile/favorites`)

      response.should.have.status(200)
      response.body.should.be.a('array')
      response.body.should.deep.include.members(
        favorites.map(({ _id, username, profile: { likedBy } }) => ({
          id: _id.toString(),
          username,
          likes: likedBy.length,
        }))
      )
    })
  })
})
