const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const moment = require('moment')
const {Types: {ObjectId}} = require('mongoose')

module.exports = {
  _id: ObjectId('5964fb80b42c79b8849b33f0'),
  checkWindowName: 'Check Window Name',
  startDate: moment('2017-09-26 00:00:01').toDate(),
  endDate: moment('2018-01-31 23:59:59').toDate(),
  checkStartDate: moment('2017-08-01 00:00:01').toDate(),
  checkEndDate: moment('2017-09-26 00:00:01').toDate(),
  forms: [],
  isDeleted: true
}
