'use strict'
const moment = require('moment')

module.exports = [
  {
    'id': 1,
    'updatedAt': moment('2017-09-21 12:17:59').toDate(),
    'createdAt': moment('2017-09-21 12:17:59').toDate(),
    'reason': 'Incorrect registration',
    'code': 1,
    'order': 0
  },
  {
    'id': 2,
    'updatedAt': moment('2017-09-21 12:18:32').toDate(),
    'createdAt': moment('2017-09-21 12:18:32').toDate(),
    'reason': 'Absent',
    'code': 2,
    'order': 1
  },
  {
    'id': 3,
    'updatedAt': moment('2017-09-21 12:19:04').toDate(),
    'createdAt': moment('2017-09-21 12:19:04').toDate(),
    'reason': 'Left school',
    'code': 3,
    'order': 2
  },
  {
    'id': 4,
    'updatedAt': moment('2017-09-21 12:21:32').toDate(),
    'createdAt': moment('2017-09-21 12:21:32').toDate(),
    'reason': 'Unable to access',
    'code': 4
  },
  {
    'id': 5,
    'updatedAt': moment('2017-09-23 12:21:32').toDate(),
    'createdAt': moment('2017-09-23 12:21:32').toDate(),
    'reason': 'Working below the overall standard of the check',
    'code': 5
  },
  {
    'id': 6,
    'updatedAt': moment('2017-09-25 12:21:32').toDate(),
    'createdAt': moment('2017-09-25 12:21:32').toDate(),
    'reason': 'Just arrived',
    'code': 6
  }
]
