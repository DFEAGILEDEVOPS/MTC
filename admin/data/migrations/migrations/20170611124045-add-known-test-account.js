'use strict'
const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const Pupil = require('../../../models/pupil')
const School = require('../../../models/school')
const config = require('../config')
const moment = require('moment')

module.exports = {

  up (db, next) {
    mongoose.connect(config.mongodb.url, async error => {
      if (error) {
        next(new Error('Could not connect to mongodb: ' + error.message))
      }
      try {
        const school = await createTestSchool()
        const pupil = await createTestPupil()
        mongoose.disconnect(() => next())
      } catch (error) {
        mongoose.disconnect(() => next(error))
      }
    })
  },

  down (db, next) {
    db.collection('pupils').remove({school: 9991999})
    db.collection('schools').remove({_id: 9991999})
    next()
  }
}

function createTestPupil () {
  return new Promise(async function (resolve, reject) {
    let pupil = new Pupil({
      school: 9991999,
      foreName: 'Automated',
      middleNames: 'Test',
      lastName: 'Account',
      gender: 'M',
      dob: moment.utc('20000101', 'YYYYMMDD'),
      pin: '9999a',
      pinExpired: false,
      hasAttended: false
    })

    try {
      pupil = await pupil.save()
      resolve(pupil)
    } catch (error) {
      reject(error)
    }
  })
}

function createTestSchool () {
  return new Promise(async function (resolve, reject) {
    let school = new School({
      leaCode: 999,
      estabCode: '1999',
      schoolPin: 'abc12345',
      name: 'Test school'
    })

    try {
      school = await school.save()
      resolve(school)
    } catch (error) {
      reject(error)
    }
  })
}
