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
        db.collection('attendancecodes').drop()
        await createAttendanceCode('Incorrect registration', 1, 0)
        await createAttendanceCode('Absent', 2, 1)
        await createAttendanceCode('Left school', 3, 2)
        await createAttendanceCode('Unable to access', 4, 3)
        await createAttendanceCode('Working below the overall standard of the check', 5, 4)
        await createAttendanceCode('Just arrived', 6, 5)
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

function createAttendanceCode (reason, code, order) {
  return new Promise(async function (resolve, reject) {
    let attendanceCode = new AttendanceCode({
      reason: reason,
      code: code,
      order: order
    })

    try {
      attendanceCode = await attendanceCode.save()
      resolve(attendanceCode)
    } catch (error) {
      reject(error)
    }
  })
}

