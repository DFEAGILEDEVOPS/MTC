const moment = require('moment')

module.exports = {
  id: 1,
  name: 'Check Window Name',
  adminStartDate: moment.utc('2017-08-26 00:00:01').toDate(),
  checkStartDate: moment.utc('2017-09-10 00:00:01').toDate(),
  checkEndDate: moment.utc('2017-09-12 00:00:01').toDate(),
  isDeleted: false
}
