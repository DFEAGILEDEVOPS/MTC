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
    name: 'live Check Window',
    adminStartDate: moment.utc().subtract(1, 'month'),
    adminEndDate: moment.utc().add(1, 'month'),
    checkStartDate: moment.utc().subtract(1, 'week'),
    checkEndDate: moment.utc().add(1, 'week'),
    familiarisationCheckStartDate: moment.utc().subtract(2, 'weeks'),
    familiarisationCheckEndDate: moment.utc().add(1, 'week'),
    isDeleted: false,
    urlSlug: '0000-0000-00000-00000'
  },

  postLiveCheckWindow: {
    id: 3,
    name: 'post Live Check Window',
    adminStartDate: moment.utc().subtract(1, 'month'),
    adminEndDate: moment.utc().add(1, 'week'),
    checkStartDate: moment.utc().subtract(2, 'week'),
    checkEndDate: moment.utc().subtract(1, 'week'),
    familiarisationCheckStartDate: moment.utc().subtract(3, 'weeks'),
    familiarisationCheckEndDate: moment.utc().subtract(2, 'week'),
    isDeleted: false,
    urlSlug: '0000-0000-00000-00000'
  },

  familiarisationCheckWindow: {
    id: 3,
    name: 'familiarisation Check Window',
    adminStartDate: moment.utc().subtract(1, 'week'),
    adminEndDate: moment.utc().add(1, 'week'),
    checkStartDate: moment.utc().add(1, 'week'),
    checkEndDate: moment.utc().add(2, 'week'),
    familiarisationCheckStartDate: moment.utc().subtract(1, 'week'),
    familiarisationCheckEndDate: moment.utc().add(2, 'week'),
    isDeleted: false,
    urlSlug: '0000-0000-00000-00000'
  },

  beforeAdminStartDate: {
    id: 4,
    name: 'before Admin Start Date',
    adminStartDate: moment.utc().add(1, 'week'),
    adminEndDate: moment.utc().add(4, 'week'),
    checkStartDate: moment.utc().add(2, 'week'),
    checkEndDate: moment.utc().add(3, 'week'),
    familiarisationCheckStartDate: moment.utc().add(1, 'week'),
    familiarisationCheckEndDate: moment.utc().add(3, 'week'),
    isDeleted: false,
    urlSlug: '0000-0000-00000-00000'
  },

  preStart: {
    id: 5,
    name: 'Pre start',
    adminStartDate: moment.utc().subtract(1, 'day'),
    adminEndDate: moment.utc().add(4, 'week'),
    checkStartDate: moment.utc().add(2, 'week'),
    checkEndDate: moment.utc().add(3, 'week'),
    familiarisationCheckStartDate: moment.utc().add(1, 'week'),
    familiarisationCheckEndDate: moment.utc().add(3, 'week'),
    isDeleted: false,
    urlSlug: '0000-0000-00000-00000'
  },

  readOnlyAdminOrUnavailable: {
    id: 6,
    name: 'Read Only Admin Or Unavailable',
    adminStartDate: moment.utc().subtract(1, 'month'),
    adminEndDate: moment.utc().subtract(1, 'day'),
    checkStartDate: moment.utc().subtract(2, 'week'),
    checkEndDate: moment.utc().subtract(1, 'week'),
    familiarisationCheckStartDate: moment.utc().subtract(3, 'weeks'),
    familiarisationCheckEndDate: moment.utc().subtract(2, 'week'),
    isDeleted: false,
    urlSlug: '0000-0000-00000-00000'
  }
}
