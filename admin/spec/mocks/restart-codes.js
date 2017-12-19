const {Types: {ObjectId}} = require('mongoose')
const moment = require('moment')

module.exports = [
  {
    '_id': ObjectId('59df7e1c283960b43172ac6b'),
    'updatedAt': moment('2017-09-21 12:17:59').toDate(),
    'createdAt': moment('2017-09-21 12:17:59').toDate(),
    'status': 'Remove restart',
    'code': 'REM'
  },
  {
    '_id': ObjectId('59df7e1c283960b43172ac6c'),
    'updatedAt': moment('2017-09-21 12:18:32').toDate(),
    'createdAt': moment('2017-09-21 12:18:32').toDate(),
    'status': 'Restart taken',
    'code': 'TKN'
  },
  {
    '_id': ObjectId('59df7e1c283960b43172ac6d'),
    'updatedAt': moment('2017-09-21 12:19:04').toDate(),
    'createdAt': moment('2017-09-21 12:19:04').toDate(),
    'status': 'Maximum number of restarts taken',
    'code': 'MAX'
  }
]
