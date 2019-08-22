'use strict'
const moment = require('moment')

const gdsFullFormat = 'D MMMM YYYY'
const gdsShortFormat = 'D MMM YYYY'
const UKFormat = 'DD/MM/YYYY'
const yearFormat = 'YYYY'
const reverseFormatNoSeparator = 'YYYYMMDD'
const timeFormatWithSeconds = 'h:mm:ss a'
const dayAndDateFormat = 'dddd, D MMMM'
const dayDateAndYearFormat = 'dddd D MMMM YYYY'
const dateAndTimeFormat = 'D MMMM YYYY h:mma'
const iso8601WithMsPrecisionAndTimeZone = 'YYYY-MM-DDTHH:mm:ss.SSSZ'
const iso8601WithMsPrecisionWithoutTimeZone = 'YYYY-MM-DDTHH:mm:ss.SSS'

const dateService = {
  formatYear: function (date) {
    return moment(date).format(yearFormat)
  },

  formatFullGdsDate: function (date) {
    return dateService.checkAndFormat(date, gdsFullFormat)
  },

  formatShortGdsDate: function (date) {
    return dateService.checkAndFormat(date, gdsShortFormat)
  },

  formatDayAndDate: function (date) {
    return moment(date).format(dayAndDateFormat)
  },

  formatDayDateAndYear: function (date) {
    return moment(date).format(dayDateAndYearFormat)
  },

  formatDateAndTime: function (date) {
    return moment(date).format(dateAndTimeFormat)
  },

  formatUKDate: function (date) {
    return dateService.checkAndFormat(date, UKFormat)
  },

  reverseFormatNoSeparator: function (date) {
    return dateService.checkAndFormat(date, reverseFormatNoSeparator)
  },

  formatTimeWithSeconds: function (date) {
    return dateService.checkAndFormat(date, timeFormatWithSeconds)
  },

  formatIso8601WithoutTimezone: function (date) {
    return dateService.checkAndFormat(date, iso8601WithMsPrecisionWithoutTimeZone)
  },

  formatIso8601: function (date) {
    return dateService.checkAndFormat(date, iso8601WithMsPrecisionAndTimeZone)
  },

  checkAndFormat: function (date, format) {
    if (!(date instanceof Date || moment.isMoment(date))) {
      throw new Error(`Invalid date type: ${date}`)
    }
    const m = moment(date)
    if (!m.isValid()) {
      throw new Error(`Invalid date: ${date}`)
    }
    return m.format(format)
  }
}

module.exports = dateService
