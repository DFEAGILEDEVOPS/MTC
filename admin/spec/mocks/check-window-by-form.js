const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const moment = require('moment')
const {Types: {ObjectId}} = require('mongoose')

module.exports = {
  '29': [{
    _id: ObjectId('59e88622d38a9f2d1fcebbb3'),
    updatedAt: moment('2017-10-20 12:43:27').toDate(),
    createdAt: moment('2017-10-19 11:01:54').toDate(),
    checkEndDate: moment('2017-10-26 00:00:00').toDate(),
    checkStartDate: moment('2017-10-25 00:00:00').toDate(),
    adminStartDate: moment('2017-10-19 00:00:00').toDate(),
    checkWindowName: 'Window Test 1',
    __v: 0,
    forms: [100, 102],
    isDeleted: false
  }],
  '32': [{
    _id: ObjectId('59e88622d38a9f2d1fcebbb3'),
    updatedAt: moment('2017-10-20 12:43:27').toDate(),
    createdAt: moment('2017-10-19 11:01:54').toDate(),
    checkEndDate: moment('2017-10-26 00:00:00').toDate(),
    checkStartDate: moment('2017-10-25 00:00:00').toDate(),
    adminStartDate: moment('2017-10-19 00:00:00').toDate(),
    checkWindowName: 'Window Test 1',
    __v: 0,
    forms: [],
    isDeleted: false
  }]
}
