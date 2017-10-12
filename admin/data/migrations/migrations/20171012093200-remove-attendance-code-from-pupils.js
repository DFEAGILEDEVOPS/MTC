'use strict'

module.exports = {

  up (db, next) {
    db.collection('pupils').update({attendanceCode: 'Incorrect Registration'}, {$rename: {reason: 'Incorrect registration'}})
    next()
  },

  down (db, next) {
    db.collection('pupils').update({reason: 'Incorrect registration'}, {$rename: {reason: 'Incorrect Registration'}})
    next()
  }
}
