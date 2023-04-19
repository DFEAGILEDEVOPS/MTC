'use strict'
const moment = require('moment')
const momentTz = require('moment-timezone')
const logger = require('./log.service').getLogger()

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
const filenameFriendly = 'YYYY-MM-DD-HHmm'
const config = require('../config')

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
    return dateService.checkAndFormat(date, dayAndDateFormat)
  },

  formatDayDateAndYear: function (date) {
    return dateService.checkAndFormat(date, dayDateAndYearFormat)
  },

  formatDateAndTime: function (date) {
    return dateService.checkAndFormat(date, dateAndTimeFormat)
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
      logger.warn(`Date parameter is not a Date or Moment object: ${date}`)
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
   * @returns {moment.Moment}
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
    const endYear = ' ' + endDate.format('YYYY')

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
   * @returns {null|moment.Moment}
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
   * @returns {null|moment.Moment}
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
   * @returns {moment.Moment}
   */
  utcNowAsMoment: () => {
    return moment.utc()
  },

  formatFileName: function (date) {
    return moment(date).format(filenameFriendly)
  },

  /**
   * Checks if a moment date is inclusively between a given time frame
   * @param {moment.Moment} date
   * @param {moment.Moment} startDate
   * @param {moment.Moment} endDate
   * @param {moment.unitOfTime.StartOf} granularity
   * @returns {boolean}
   */
  isBetweenInclusive: function (date, startDate, endDate, granularity = null) {
    return date.isBetween(startDate, endDate, granularity, '[]')
  },

  /**
   * Format utility to generate a GDS compliant date range from two input dates.  E.g. "1 to 25 June 2021", or "21 May
   * 2021 to 25 June 2021"
   * @param {moment.Moment} d1
   * @param {moment.Moment} d2
   * @return {string}
   */
  getGdsDateRangeLabel: function getGdsDateRangeLabel (d1, d2) {
    if (d1.month() === d2.month() && d1.year() === d2.year()) {
      return d1.date() + ' to ' + this.formatFullGdsDate(d2)
    }
    return this.formatFullGdsDate(d1) + ' to ' + this.formatFullGdsDate(d2)
  },

  /**
   * Return start of the day, e.g. 00:00, with default app tz
   * @param {string} tz - valid timezone, e.g. 'Europe/London'
   * @return {moment.Moment}
   */
  tzStartOfDay: function (tz) {
    if (tz === undefined || tz === null) {
      tz = config.DEFAULT_TIMEZONE
    }
    return momentTz.tz(tz).startOf('day')
  },

  /**
   * Return 8am in the TZ supplied, or the app default tz
   * @param {string} tz - valid timezone, e.g. 'Europe/London'
   * @return {moment.Moment}
   */
  tzEightAmToday: function (tz) {
    if (tz === undefined || tz === null) {
      tz = config.DEFAULT_TIMEZONE
    }
    return momentTz.tz(tz).startOf('day').add(8, 'hours')
  },

  /**
   * Return 4pm in the TZ supplied, or the app default tz
   * @param {string} tz - valid timezone, e.g. 'Europe/London'
   * @return {moment.Moment}
   */
  tzFourPmToday: function (tz) {
    if (tz === undefined || tz === null) {
      tz = config.DEFAULT_TIMEZONE
    }
    return momentTz.tz(tz).startOf('day').add(16, 'hours')
  },

  /**
   * Return end of day in the tz supplied or the app default tz
   * @param {string} tz - valid timezone, e.g. 'Europe/London'
   * @return {moment.Moment}
   */
  tzEndOfDay: function (tz) {
    if (tz === undefined || tz === null) {
      tz = config.DEFAULT_TIMEZONE
    }
    return momentTz.tz(tz).endOf('day')
  }
}

module.exports = dateService
