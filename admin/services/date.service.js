'use strict'
const moment = require('moment')

const gdsFullFormat = 'D MMMM YYYY'
const gdsShortFormat = 'D MMM YYYY'
const UKFormat = 'DD/MM/YYYY'
const reverseFormatNoSeparator = 'YYYYMMDD'
const timeFormatWithSeconds = 'h:mm:ss a'
// this is neither GDS nor Long.  @pris54 to review
const gdsLongFormat = 'DD MMM YYYY'
const dayAndDateFormat = 'dddd D MMMM'

const dateService = {
  formatFullGdsDate: function (date) {
    return this.checkAndFormat(date, gdsFullFormat)
  },

  // This is probably one too many
  formatLongGdsDate: (date) => {
    return this.checkAndFormat(date, gdsLongFormat)
  },

  formatShortGdsDate: function (date) {
    return this.checkAndFormat(date, gdsShortFormat)
  },

  formatDayAndDate: (date) => {
    return moment(date).format(dayAndDateFormat)
  },

  formatUKDate: function (date) {
    return this.checkAndFormat(date, UKFormat)
  },

  reverseFormatNoSeparator: function (date) {
    return this.checkAndFormat(date, reverseFormatNoSeparator)
  },

  formatTimeWithSeconds: function (date) {
    return this.checkAndFormat(date, timeFormatWithSeconds)
  },

  checkAndFormat: function (date, format) {
    if (!(date instanceof Date)) {
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
