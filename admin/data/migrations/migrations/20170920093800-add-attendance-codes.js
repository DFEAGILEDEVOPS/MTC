'use strict'

const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const config = require('../config')
const AttendanceCode = require('../../../models/attendance-code')

module.exports = {
  up (db, next) {
    mongoose.connect(config.mongodb.url, async error => {
      const attendaceCodesToExport =
        [
          {
            'reason': 'Absent',
            'code': 1
          },
          {
            'reason': 'Left',
            'code': 2
          },
          {
            'reason': 'Incorrect Registration',
            'code': 3
          },
          {
            'reason': 'Withdrawn',
            'code': 4
          }
        ]

      if (error) {
        next(new Error('Could not connect to mongodb: ' + error.message))
      }

      await attendaceCodesToExport.forEach(async (ac, i) => {
        try {
          await createAttendanceCode(ac.reason, ac.code)
        } catch (error) {
          console.log('ERROR', error)
          next(error)
        }
      })

      mongoose.disconnect(() => next())
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
