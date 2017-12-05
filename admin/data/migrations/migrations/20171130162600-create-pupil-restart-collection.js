'use strict'

module.exports = {

  up (db, next) {
    db.createCollection('pupilrestarts')
    next()
  },

  down (db, next) {
    db.collection('pupilrestarts').drop()
    next()
  }
}
