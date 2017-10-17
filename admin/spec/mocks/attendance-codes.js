const {Types: {ObjectId}} = require('mongoose')
const moment = require('moment')

module.exports = [
  {
    '_id': ObjectId('59df7e1c283960b43172ac6b'),
    'updatedAt': moment('2017-09-21 12:17:59').toDate(),
    'createdAt': moment('2017-09-21 12:17:59').toDate(),
    'reason': 'Incorrect registration',
    'code': 1,
    'order': 0
  },
  {
    '_id': ObjectId('59df7e1c283960b43172ac6c'),
    'updatedAt': moment('2017-09-21 12:18:32').toDate(),
    'createdAt': moment('2017-09-21 12:18:32').toDate(),
    'reason': 'Absent',
    'code': 2,
    'order': 1
  },
  {
    '_id': ObjectId('59df7e1c283960b43172ac6d'),
    'updatedAt': moment('2017-09-21 12:19:04').toDate(),
    'createdAt': moment('2017-09-21 12:19:04').toDate(),
    'reason': 'Left school',
    'code': 3,
    'order': 2
  },
  {
    '_id': ObjectId('59df7e1c283960b43172ac6e'),
    'updatedAt': moment('2017-09-21 12:21:32').toDate(),
    'createdAt': moment('2017-09-21 12:21:32').toDate(),
    'reason': 'Unable to access',
    'code': 4
  },
  {
    '_id': ObjectId('59df7e1c283960b43172ac6f'),
    'updatedAt': moment('2017-09-23 12:21:32').toDate(),
    'createdAt': moment('2017-09-23 12:21:32').toDate(),
    'reason': 'Working below the overall standard of the check',
    'code': 5
  },
  {
    '_id': ObjectId('59df7e1c283960b43172ac70'),
    'updatedAt': moment('2017-09-25 12:21:32').toDate(),
    'createdAt': moment('2017-09-25 12:21:32').toDate(),
    'reason': 'Just arrived',
    'code': 6
  }
]
