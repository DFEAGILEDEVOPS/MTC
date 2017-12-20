const { Types: { ObjectId } } = require('mongoose')
const moment = require('moment')

module.exports = [
  {
    '_id': ObjectId('59df7e1c283960b43172ac7b'),
    'updatedAt': moment('2017-09-21 12:17:59').toDate(),
    'createdAt': moment('2017-09-21 12:17:59').toDate(),
    'statusDesc': 'Not started',
    'code': 'NTS',
    '__v': 0
  },
  {
    '_id': ObjectId('59df7e1c283960b43172ac7c'),
    'updatedAt': moment('2017-09-21 12:17:59').toDate(),
    'createdAt': moment('2017-09-21 12:17:59').toDate(),
    'statusDesc': 'PIN generated',
    'code': 'PIN',
    '__v': 0
  },
  {
    '_id': ObjectId('59df7e1c283960b43172ac7d'),
    'updatedAt': moment('2017-09-21 12:17:59').toDate(),
    'createdAt': moment('2017-09-21 12:17:59').toDate(),
    'statusDesc': 'In Progress',
    'code': 'INP',
    '__v': 0
  },
  {
    '_id': ObjectId('59df7e1c283960b43172ac7e'),
    'updatedAt': moment('2017-09-21 12:17:59').toDate(),
    'createdAt': moment('2017-09-21 12:17:59').toDate(),
    'statusDesc': 'Check started',
    'code': 'CHS',
    '__v': 0
  },
  {
    '_id': ObjectId('59df7e1c283960b43172ac7f'),
    'updatedAt': moment('2017-09-21 12:17:59').toDate(),
    'createdAt': moment('2017-09-21 12:17:59').toDate(),
    'statusDesc': 'Restart',
    'code': 'RES',
    '__v': 0
  },
  {
    '_id': ObjectId('59df7e1c283960b43172ac7a'),
    'updatedAt': moment('2017-09-21 12:17:59').toDate(),
    'createdAt': moment('2017-09-21 12:17:59').toDate(),
    'statusDesc': 'Not taking the Check',
    'code': 'NTC',
    '__v': 0
  },
  {
    '_id': ObjectId('59df7e1c283960b43172ac71'),
    'updatedAt': moment('2017-09-21 12:17:59').toDate(),
    'createdAt': moment('2017-09-21 12:17:59').toDate(),
    'statusDesc': 'Completed',
    'code': 'COM',
    '__v': 0
  }
]
