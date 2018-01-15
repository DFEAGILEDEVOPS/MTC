'use strict'

const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const moment = require('moment')

const Pupil = require('../../../models/pupil')
const config = require('../config')
const upnService = require('../../../services/upn.service')

module.exports = {

  up (db, next) {
    mongoose.connect(config.mongodb.url, async error => {
      if (error) {
        next(new Error('Could not connect to mongodb: ' + error.message))
      }

      // Add this schema element to all existing pupils
      await db.collection('pupils').update({}, {$set: {checkOptions: { speechSynthesis: false }}}, {multi: true})

      try {
        const speechUser = new Pupil({
          school: 9991999,
          upn: upnService.calculateCheckLetter('999199900002') + '999199900002',
          foreName: 'Sam',
          lastName: 'Charles',
          gender: 'M',
          dob: moment.utc('2009-11-30 00:00:00'),
          pin: '8888',
          pinExpiresAt: moment.utc('2025-12-31 23:59:59'),
          checkOptions: {
            speechSynthesis: true
          }
        })
        await speechUser.save()
      } catch (error) {
        return next(error)
      }

      mongoose.disconnect(() => next())
    })
  },

  down (db, next) {
    // remove checkOptions sub-document
    db.collection('pupils').update({}, {$unset: {checkOptions: { speechSynthesis: false }}}, {multi: true})

    db.collection('pupils').removeOne({ pin: '8888a' })
      .then((result) => next())
  }
}
