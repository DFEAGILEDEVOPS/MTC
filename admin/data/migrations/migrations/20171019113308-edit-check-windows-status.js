'use strict'

const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const config = require('../config')

module.exports = {
  up (db, next) {
    mongoose.connect(config.mongodb.url, async error => {
      if (error) {
        next(new Error('Could not connect to mongodb: ' + error.message))
      }
      try {
        await db.collection('checkwindows').update({}, {$set: {'isDeleted': false}}, {multi: true})
        mongoose.disconnect(() => next())
      } catch (error) {
        console.log('ERROR', error)
        next(error)
      }
    })
  },

  down (db, next) {
    mongoose.connect(config.mongodb.url, async error => {
      if (error) {
        next(new Error('Could not connect to mongodb: ' + error.message))
      }
      try {
        db.collection('checkwindows').update({}, {$unset: {'isDeleted': 1}}, {multi: true})
        mongoose.disconnect(() => next())
      } catch (error) {
        console.log('ERROR', error)
        next(error)
      }
    })
  }
}
