'use strict'

const mongoose = require('mongoose')
mongoose.Promise = global.Promise

const User = require('../../../models/user')
const config = require('../config')

module.exports = {

  up (db, next) {
    mongoose.connect(config.mongodb.url, async error => {
      if (error) {
        next(new Error('Could not connect to mongodb: ' + error.message))
      }

      try {
        const serviceManager = new User({
          email: 'service-manager',
          passwordHash: '$2a$10$.WsawgZpWSAQVaa6Vz3P1.XO.1YntYJLd6Da5lrXCAkVxhhLpkOHK',
          school: '9991001',
          role: 'SERVICE-MANAGER'
        })
        await serviceManager.save()
      } catch (error) {
        return next(error)
      }

      mongoose.disconnect(() => next())
    })
  },

  down (db, next) {
    db.collection('users').removeOne({ 'email': 'service-manager' })
    .then((result) => next())
  }
}
