'use strict'

const mongoose = require('mongoose')
mongoose.Promise = global.Promise

const Group = require('../../../models/group')
const config = require('../config')

module.exports = {

  up (db, next) {
    mongoose.connect(config.mongodb.url, async error => {
      if (error) {
        next(new Error('Could not connect to mongodb: ' + error.message))
      }

      try {
        const newGroup = new Group({
          name: 'Test Group 1',
          pupils: {},
          isDeleted: false
        })
        await newGroup.save()
      } catch (error) {
        return next(error)
      }

      mongoose.disconnect(() => next())
    })
  },

  down (db, next) {
    db.collection('groups').removeOne({name: 'Test Group 1'})
    .then((result) => next())
  }
}
