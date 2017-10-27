'use strict'
const moment = require('moment')
const CheckWindow = require('../models/check-window')

const checkWindowService = {

  /**
   * Get check window for the current time.
   * @returns {Promise.<*>}
   */
  getCurrentCheckWindow: async () => {
    const now = new Date()
    const checkWindow = await CheckWindow.findOne({startDate: {$lte: now}, endDate: {$gte: now}}).exec()
    if (!checkWindow) {
      throw new Error('No checkwindow is currently available')
    }
    return checkWindow
  },
  /**
   * Format check period (start and end dates).
   * @param startDate
   * @param endDate
   * @returns {string}
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
   * Format check windows document, prepare to parse in view.
   * @param checkWindows
   * @param isCurrent
   * @param canRemove
   */
  formatCheckWindowDocuments: (checkWindows, isCurrent, canRemove) => {
    return checkWindows.map(cw => {
      const adminStartDateMo = moment(cw.adminStartDate)
      const checkStartDateMo = moment(cw.checkStartDate)
      const checkEndDateMo = moment(cw.checkEndDate)

      return {
        id: cw._id,
        checkWindowName: cw.checkWindowName,
        adminStartDate: adminStartDateMo.format('DD MMM YYYY'),
        checkDates: checkWindowService.formatCheckPeriod(checkStartDateMo, checkEndDateMo),
        canRemove: typeof canRemove === 'boolean' ? canRemove : (Date.parse(cw.checkStartDate) >= Date.now()),
        isCurrent: isCurrent
      }
    })
  },
  formatCheckWindowDate: (dateItem, keyDay, keyMonth, keyYear) => {
    return moment.utc(
      '' + dateItem[keyDay] +
      '/' + dateItem[keyMonth] +
      '/' + dateItem[keyYear],
      'DD/MM/YYYY').toDate()
  }
}

module.exports = checkWindowService
