'use strict'

module.exports = {

  up (db, next) {
    db.collection('checkforms').update({ _id: 100 }, {
      $set: {
        'questions.2': {
          f1: 5,
          f2: 10
        },
        'questions.3': {
          f1: 4,
          f2: 4
        }
      }
    })
    next()
  },

  down (db, next) {
    db.collection('checkforms').update({ _id: 100 }, {
      $set: {
        'questions.2': {
          f1: 8,
          f2: 9
        },
        'questions.3': {
          f1: 7,
          f2: 7
        }
      }
    })
    next()
  }
}
