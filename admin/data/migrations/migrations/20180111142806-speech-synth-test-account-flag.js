'use strict'

module.exports = {

  up (db, next) {
    db.collection('pupils').update({school: 9991999, foreName: 'Sam', lastName: 'Charles'}, { $set: {'isTestAccount': true} })
    next()
  },

  down (db, next) {
    db.collection('pupils').update({school: 9991999, foreName: 'Sam', lastName: 'Charles'}, { $set: {'isTestAccount': false} })
    next()
  }
}
