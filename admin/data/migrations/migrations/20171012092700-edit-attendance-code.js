'use strict'

module.exports = {

  up (db, next) {
    db.collection('attendancecodes').update({reason: 'Incorrect Registration'}, {$rename: {reason: 'Incorrect registration'}})
    next()
  },

  down (db, next) {
    db.collection('attendancecodes').update({reason: 'Incorrect registration'}, {$rename: {reason: 'Incorrect Registration'}})
    next()
  }
}
