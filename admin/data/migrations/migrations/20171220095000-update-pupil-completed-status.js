'use strict'

module.exports = {

  up (db, next) {
    db.collection('pupilstatuscodes').update({ code: 'COM' }, { $set: {'statusDesc': 'Completed'} })
    next()
  },

  down (db, next) {
    db.collection('pupilstatuscodes').update({ code: 'COM' }, { $set: {'statusDesc': 'Complete'} })
    next()
  }
}
