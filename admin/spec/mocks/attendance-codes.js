const {Types: {ObjectId}} = require('mongoose')
const moment = require('moment')

module.exports = [
  {
    '_id': ObjectId('59c39fe72186e6748a58bbc4'),
    'updatedAt': moment('2017-09-21 12:17:59').toDate(),
    'createdAt': moment('2017-09-21 12:17:59').toDate(),
    'reason': 'reason 1',
    'code': 1
  },
  {
    '_id': ObjectId('59c39fe72186e6748a58bbc5'),
    'updatedAt': moment('2017-09-21 12:18:32').toDate(),
    'createdAt': moment('2017-09-21 12:18:32').toDate(),
    'reason': 'reason 2',
    'code': 2
  },
  {
    '_id': ObjectId('59c39fe72186e6748a58bbc6'),
    'updatedAt': moment('2017-09-21 12:19:04').toDate(),
    'createdAt': moment('2017-09-21 12:19:04').toDate(),
    'reason': 'reason 3',
    'code': 3
  },
  {
    '_id': ObjectId('59c39fe72186e6748a58bbc7'),
    'updatedAt': moment('2017-09-21 12:21:32').toDate(),
    'createdAt': moment('2017-09-21 12:21:32').toDate(),
    'reason': 'reason 4',
    'code': 4
  }
]
