const authController = require('./auth/controller')
const profileController = require('./profile/controller')
const usersController = require('./users/controller')

module.exports = { auth: authController, profile: profileController, users: usersController }
