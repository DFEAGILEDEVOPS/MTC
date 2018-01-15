'use strict'
const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const Pupil = require('../../../models/pupil')
const config = require('../config')
const moment = require('moment')

const conditions = {
  school: 9991999,
  foreName: 'Automated',
  middleNames: 'Test',
  lastName: 'Account',
  gender: 'M',
  dob: moment.utc('20000101', 'YYYYMMDD'),
  pin: '9999'
}

const update = {
  pinExpiresAt: moment().startOf('day').add(10, 'years').toISOString()
}

module.exports = {
  up (db, next) {
    mongoose.connect(config.mongodb.url, async error => {
      if (error) {
        next(new Error('Could not connect to mongodb: ' + error.message))
      }
      try {
        await updateKnownTestAccount(conditions, update)
        mongoose.disconnect(() => next())
      } catch (error) {
        mongoose.disconnect(() => next(error))
      }
    })
  },

  down (db, next) {
    next()
  }
}

function updateKnownTestAccount (conditions, update) {
  return new Promise(async function (resolve, reject) {
    try {
      await Pupil.findOneAndUpdate(conditions, update)
      resolve()
    } catch (error) {
      reject(error)
    }
  })
}

// TODO remove pinExpired and hasAttended from pupils
