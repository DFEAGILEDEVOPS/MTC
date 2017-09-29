const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const moment = require('moment')

module.exports = {
  _id: mongoose.Types.ObjectId(),
  name: 'Check Window Name',
  startDate: moment('2017-09-26 00:00:01').toDate(),
  endDate: moment('2018-01-31 23:59:59').toDate(),
  registrationStartDate: moment('2017-08-01 00:00:01').toDate(),
  registrationEndDate: moment('2017-09-26 00:00:01').toDate()
}
