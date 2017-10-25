'use strict'
const moment = require('moment')

const gdsFullFormat = 'D MMMM YYYY'
const gdsShortFormat = 'D MMM YYYY'
const UKFormat = 'DD/MM/YYYY'
const reverseFormatNoSeparator = 'YYYYMMDD'
const timeFormatWithSeconds = 'h:mm:ss a'

const dateService = {
  formatFullGdsDate: function (date) {
    return this.checkAndFormat(date, gdsFullFormat)
  },

  formatShortGdsDate: function (date) {
    return this.checkAndFormat(date, gdsShortFormat)
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
