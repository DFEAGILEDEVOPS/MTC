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
  },
  /**
   * Format check windows dates.
   * @param dateItem
   * @param keyDay
   * @param keyMonth
   * @param keyYear
   * @returns {Date}
   */
  formatDateFromRequest: (dateItem, keyDay, keyMonth, keyYear) => {
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
  formatCheckPeriod: (startDate, endDate) => {
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
   * @return {Moment}
   */
  createFromDayMonthYear: (day, month, year) => {
    const paddedDay = (+day).toString().padStart(2, '0')
    const paddedMonth = (+month).toString().padStart(2, '0')
    const data = paddedDay + '/' + paddedMonth + '/' + (+year).toString()
    const date = moment.utc(data, 'DD/MM/YYYY', true)
    if (!date.isValid()) {
      return null
    }
    return date
  }

}

module.exports = dateService
