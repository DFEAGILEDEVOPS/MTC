const moment = require('moment')

module.exports = {
  legacy: {
    id: 1,
    name: 'Check Window Name',
    adminStartDate: moment.utc('2017-08-26 00:00:01'),
    checkStartDate: moment.utc('2017-09-10 00:00:01'),
    checkEndDate: moment.utc('2017-09-12 00:00:01'),
    isDeleted: false
  },

  liveCheckWindow: {
    id: 2,
    name: 'Check Window Name',
    adminStartDate: moment.utc().subtract(1, 'month'),
    adminEndDate: moment.utc().add(1, 'month'),
    checkStartDate: moment.utc().subtract(1, 'week'),
    checkEndDate: moment.utc().add(1, 'week'),
    familiarisationCheckStartDate: moment.utc().subtract(2, 'weeks'),
    familiarisationCheckEndDate: moment.utc().add(1, 'week'),
    isDeleted: false,
    urlSlug: '0000-0000-00000-00000'
  }
}
