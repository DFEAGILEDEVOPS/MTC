'use strict'
const moment = require('moment')

const UKFormat = 'DD/MM/YYYY'
const reverseFormatNoSeparator = 'YYYYMMDD'
const timeFormatWithSeconds = 'h:mm:ss a'
const iso8601WithMsPrecisionAndTimeZone = 'YYYY-MM-DDTHH:mm:ss.SSSZ'

const dateService = {
  formatUKDate: function (date) {
    return dateService.checkAndFormat(date, UKFormat)
  },

  reverseFormatNoSeparator: function (date) {
    return dateService.checkAndFormat(date, reverseFormatNoSeparator)
  },

  formatTimeWithSeconds: function (date) {
    return dateService.checkAndFormat(date, timeFormatWithSeconds)
  },

  formatIso8601: function (momentDate) {
    if (!moment.isMoment(momentDate)) {
      throw new Error('Parameter must be of type Moment')
    }
    if (!momentDate.isValid()) {
      throw new Error('Not a valid date')
    }
    return momentDate.format(iso8601WithMsPrecisionAndTimeZone)
  },

  checkAndFormat: function (date, format) {
    if (!(date instanceof Date || moment.isMoment(date))) {
      return ''
    }
    const m = moment(date)
    if (!m.isValid()) {
      return ''
    }
    return m.format(format)
  }
}

module.exports = dateService
