'use strict'

module.exports = {

  up (db, next) {
    db.collection('pupils').update({}, {$unset: {attendanceCode: 1}}, {multi: true})
    next()
  }
}
