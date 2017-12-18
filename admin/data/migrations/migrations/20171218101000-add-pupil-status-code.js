'use strict'

const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const config = require('../config')
const PupilStatusCode = require('../../../models/pupil-status-code')

module.exports = {
  up (db, next) {
    mongoose.connect(config.mongodb.url, async error => {
      if (error) {
        next(new Error('Could not connect to mongodb: ' + error.message))
      }

      try {
        await createPupilStatusCode('Not started', 'NTS')
        await createPupilStatusCode('PIN generated', 'PIN')
        await createPupilStatusCode('In Progress', 'INP')
        await createPupilStatusCode('Check started', 'CHS')
        await createPupilStatusCode('Restart', 'RES')
        await createPupilStatusCode('Not taking the Check', 'NTC')
        await createPupilStatusCode('Complete', 'COM')
        mongoose.disconnect(() => next())
      } catch (error) {
        console.log('ERROR', error)
        next(error)
      }
    })
  },

  down (db, next) {
    db.collection('pupilstatuscodes').drop()
    next()
  }
}

function createPupilStatusCode (statusDesc, code) {
  return new Promise(async function (resolve, reject) {
    let pupilStatusCode = new PupilStatusCode({
      statusDesc: statusDesc,
      code: code
    })

    try {
      pupilStatusCode = await pupilStatusCode.save()
      resolve(pupilStatusCode)
    } catch (error) {
      reject(error)
    }
  })
}
