'use strict'

module.exports = {

  up (db, next) {
    db.collection('pupils').updateOne({pin: '8888a'}, {$set: {'checkOptions.speechSynthesis': true}})
    next()
  },

  down (db, next) {
    db.collection('pupils').updateOne({pin: '8888a'}, {$set: {'checkOptions.speechSynthesis': false}})
    next()
  }
}
