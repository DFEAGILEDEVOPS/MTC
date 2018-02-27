const moment = require('moment')

module.exports = {
  checkWindowName: 'Check Window Name',
  startDate: moment.utc('2017-08-26 00:00:01').toDate(),
  endDate: moment.utc('2018-01-31 23:59:59').toDate(),
  checkStartDate: moment.utc('2017-09-10 00:00:01').toDate(),
  checkEndDate: moment.utc('2017-09-12 00:00:01').toDate(),
  forms: [100, 101, 102, 103],
  isDeleted: false
}
