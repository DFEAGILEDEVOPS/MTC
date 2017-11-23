'use strict'

module.exports = {

  up (db, next) {
    db.collection('pupils').update({foreName: 'Automated', lastName: 'Account'}, { $set: {'isTestAccount': true} })
    next()
  },

  down (db, next) {
    db.collection('pupils').update({foreName: 'Automated', lastName: 'Account'}, { $set: {'isTestAccount': false} })
    next()
  }
}
