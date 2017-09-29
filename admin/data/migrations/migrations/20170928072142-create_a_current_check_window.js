'use strict'
const moment = require('moment')

module.exports = {

  up (db, next) {
    db.collection('checkwindows').update(
      {name: 'Summer 2017'},
      {$set: {endDate: moment.utc('2018-01-31 23:59:59').toDate()}},
      false,
      false
    )
    next()
  },

  down (db, next) {
    db.collection('checkwindows').update(
      {name: 'Summer 2017'},
      {$set: {endDate: moment.utc('2017-06-30 23:59:59').toDate()}},
      false,
      false
    )
    next()
  }
}
