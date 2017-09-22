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
        await createAttendanceCode('Absent', 1)
        await createAttendanceCode('Left', 2)
        await createAttendanceCode('Incorrect Registration', 3)
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
