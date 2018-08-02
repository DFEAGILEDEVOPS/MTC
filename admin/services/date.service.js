'use strict'
const moment = require('moment')
const winston = require('winston')
const monitor = require('../helpers/monitor')

const gdsFullFormat = 'D MMMM YYYY'
const gdsShortFormat = 'D MMM YYYY'
const UKFormat = 'DD/MM/YYYY'
const reverseFormatNoSeparator = 'YYYYMMDD'
const timeFormatWithSeconds = 'h:mm:ss a'
const dayAndDateFormat = 'dddd D MMMM'
const dateAndTimeFormat = 'D MMMM YYYY h:mma'
const iso8601WithMsPrecisionAndTimeZone = 'YYYY-MM-DDTHH:mm:ss.SSSZ'

const dateService = {
  formatFullGdsDate: function (date) {
    return dateService.checkAndFormat(date, gdsFullFormat)
  },

  formatShortGdsDate: function (date) {
    return dateService.checkAndFormat(date, gdsShortFormat)
  },

  formatDayAndDate: function (date) {
    return moment(date).format(dayAndDateFormat)
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
      winston.warn(`Date parameter is not a Date or Moment object: ${date}`)
      return ''
    }
    const m = moment(date)
    if (!m.isValid()) {
      return ''
    }
    return m.format(format)
  },
  /**
   * Format check windows dates.
   * @param dateItem
   * @param keyDay
   * @param keyMonth
   * @param keyYear
   * @returns {Moment}
   */
  formatDateFromRequest: function (dateItem, keyDay, keyMonth, keyYear) {
    return moment.utc(
      '' + dateItem[keyDay] +
      '/' + dateItem[keyMonth] +
      '/' + dateItem[keyYear],
      'D/MM/YYYY')
  },

  /**
   * Format period (start and end dates)
   * @param startDate
   * @param endDate
   * @returns {string} E.g. "1 Nov to 20 Nov 2017" or "1 Dec 2016 to 1 Jan 2017"
   */
  formatCheckPeriod: function (startDate, endDate) {
    let startYear = ' ' + startDate.format('YYYY')
    let endYear = ' ' + endDate.format('YYYY')

    if (startYear === endYear) {
      startYear = ''
    }
    return startDate.format('D MMM') + startYear + ' to ' + endDate.format('D MMM YYYY')
  },

  /**
   * Return a moment object from the a day, month and year. The time component will be zeroed out. Returns null if invalid.
   * @param {number|string} day
   * @param {number|string} month
   * @param {number|string} year
   * @returns {Moment}
   */
  createLocalTimeFromDayMonthYear: function (day, month, year) {
    const paddedDay = (+day).toString().padStart(2, '0')
    const paddedMonth = (+month).toString().padStart(2, '0')
    const data = paddedDay + '/' + paddedMonth + '/' + (+year).toString()
    const date = moment(data, 'DD/MM/YYYY', true)
    if (!date.isValid()) {
      return null
    }
    return date
  },
  /**
   * Return a UTC-mode moment object from the a day, month and year. The time component will be zeroed out. Returns null if invalid.
   * @param {number|string} day
   * @param {number|string} month
   * @param {number|string} year
   * @returns {Moment}
   */
  createUTCFromDayMonthYear: function (day, month, year) {
    const paddedDay = (+day).toString().padStart(2, '0')
    const paddedMonth = (+month).toString().padStart(2, '0')
    const data = paddedDay + '/' + paddedMonth + '/' + (+year).toString()
    const date = moment.utc(data, 'DD/MM/YYYY', true)
    if (!date.isValid()) {
      return null
    }
    return date
  },
  /**
   * returns current UTC date and time as moment
   * @returns {Moment}
   */
  utcNowAsMoment: () => {
    return moment.utc()
  }
}

module.exports = monitor('date.service', dateService)
