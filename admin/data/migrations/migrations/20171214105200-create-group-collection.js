'use strict'

module.exports = {
  up (db, next) {
    db.createCollection('groups')
    next()
  },

  down (db, next) {
    db.collection('groups').drop()
    next()
  }
}
