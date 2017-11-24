const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const moment = require('moment')

module.exports = {
  _id: 29,
  name: 'MTC0061',
  updatedAt: moment.utc('2017-11-21 15:21:40').toDate(),
  createdAt: moment.utc('2017-11-21T15:21:40').toDate(),
  questions: [
    { f1: 1, f2: 8 },
    { f1: 3, f2: 4 },
    { f1: 4, f2: 5 },
    { f1: 3, f2: 8 },
    { f1: 6, f2: 7 },
    { f1: 11, f2: 3 },
    { f1: 10, f2: 1 },
    { f1: 9, f2: 8 },
    { f1: 7, f2: 9 },
    { f1: 12, f2: 11 }
  ],
  __v: 0,
  isDeleted: false
}
