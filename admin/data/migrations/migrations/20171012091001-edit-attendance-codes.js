'use strict'

const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const config = require('../config')
const AttendanceCode = require('../../../models/attendance-code')

module.exports = {
  up (db, next) {
    mongoose.connect(config.mongodb.url, async error => {
      if (error) {
        next(new Error('Could not connect to mongodb: ' + error.message))
      }

      try {
        await AttendanceCode.deleteOne({ reason: 'Withdrawn' })
        mongoose.disconnect(() => next())
      } catch (error) {
        console.log('ERROR', error)
        next(error)
      }

      try {
        await createAttendanceCode('Working below the overall standard of the check', 4)
        await createAttendanceCode('Unable to access', 5)
        await createAttendanceCode('Just arrived', 6)
        await createAttendanceCode('Withdrawn', 4)
        mongoose.disconnect(() => next())
      } catch (error) {
        console.log('ERROR', error)
        next(error)
      }
    })
  },

  down (db, next) {
    db.collection('attendancecodes').drop()
    next()
  }
}

function createAttendanceCode (reason, code) {
  return new Promise(async function (resolve, reject) {
    let attendanceCode = new AttendanceCode({
      reason: reason,
      code: code
    })

    try {
      attendanceCode = await attendanceCode.save()
      resolve(attendanceCode)
    } catch (error) {
      reject(error)
    }
  })
}
