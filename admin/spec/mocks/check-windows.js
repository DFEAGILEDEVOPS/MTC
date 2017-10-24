const {Types: {ObjectId}} = require('mongoose')
const moment = require('moment')

module.exports = [
  {
    _id: ObjectId('59e8e10039dbad3cd033719a'),
    updatedAt: moment('2017-10-19 17:29:36').toDate(),
    createdAt: moment('2017-10-19 17:29:36').toDate(),
    checkEndDate: moment('2018-01-20 00:00:00').toDate(),
    checkStartDate: moment('2018-01-10 00:00:00').toDate(),
    adminStartDate: moment('2017-10-18 00:00:00').toDate(),
    checkWindowName: 'Test window 3',
    __v: 0,
    forms: [],
    deleted: false
  },
  {
    _id: ObjectId('59e88622d38a9f2d1fcebbb3'),
    updatedAt: moment('2017-10-19 11:01:54').toDate(),
    createdAt: moment('2017-10-19 11:01:54').toDate(),
    checkEndDate: moment('2017-11-28 00:00:00').toDate(),
    checkStartDate: moment('2017-10-25 00:00:00').toDate(),
    adminStartDate: moment('2017-10-19 00:00:00').toDate(),
    checkWindowName: 'Window Test 1',
    __v: 0,
    forms: [],
    deleted: false
  },
  {
    _id: ObjectId('59e886778f28f92d312c3870'),
    updatedAt: moment('2017-10-19 17:36:25').toDate(),
    createdAt: moment('2017-10-19 11:03:19').toDate(),
    checkEndDate: moment('2017-10-28 00:00:00').toDate(),
    checkStartDate: moment('2017-10-15 00:00:00').toDate(),
    adminStartDate: moment('2017-10-19 00:00:00').toDate(),
    checkWindowName: 'Window Test 2',
    __v: 0,
    forms: [],
    deleted: false
  }
]
