'use strict'

const moment = require('moment')
const checkWindowDataService = require('./data-access/check-window.data.service')
const dateService = require('../services/date.service')
const checkFormDataService = require('./data-access/check-form.data.service')

const checkWindowService = {
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
        id: cw.id,
        checkWindowName: cw.name,
        adminStartDate: adminStartDateMo.format('D MMM YYYY'),
        checkDates: dateService.formatCheckPeriod(checkStartDateMo, checkEndDateMo),
        canRemove: typeof canRemove === 'boolean' ? canRemove : moment(cw.checkStartDate).isSameOrAfter(dateService.utcNowAsMoment()),
        isCurrent: isCurrent
      }
    })
  },

  /**
   * Retrieve all check window names, sorted by date for a set of forms.
   * @param {Array<number>} formIds an array of integer formIds
   */
  getCheckWindowsAssignedToForms: async (formIds) => {
    return checkWindowDataService.sqlFindCheckWindowsAssignedToForms(formIds)
  },

  /**
   * Soft delete check window.
   * @param checkForm
   * @returns {Promise<void>}
   */
  markAsDeleted: async (checkForm) => {
    if (!checkForm || !checkForm.id) {
      throw new Error('Form with an id is required')
    }
    // Only mark as deleted if:
    // 1. there is no check window assigned or
    // 2. the check window has not yet started.
    const checkWindows = await checkWindowDataService.sqlFindCheckWindowsAssignedToForms([checkForm.id])
    if (checkWindows && checkWindows.length > 0) {
      let now = moment.utc()
      for (let index = 0; index < checkWindows.length; index++) {
        const window = checkWindows[index]
        if (window.checkStartDate.isSameOrAfter(now)) {
          throw new Error(`Unable to delete check-form ${window.id} as it is assigned to 
          CheckWindow ${window.name} which has a start date in the past`)
        }
      }
    }
    return checkFormDataService.sqlMarkFormAsDeleted(checkForm.id)
  },

  /**
   * Get current check windows and count forms assigned.
   * @returns {Promise<*|null>}
   */
  getCurrentCheckWindowsAndCountForms: async () => {
    let checkWindowsList = null
    let checkWindowsListData = await checkWindowDataService.sqlFindCurrent('', '')
    if (checkWindowsListData) {
      checkWindowsList = checkWindowsListData.map((cw) => {
        return {
          'id': cw.id,
          'checkWindowName': cw.name,
          'totalForms': cw.FormCount
        }
      })
    }
    return checkWindowsList
  },

  /**
   * Merge existing (db saved) and new (passed via form) check form ids.
   * @param existingForms
   * @param newForms
   * @returns {Array}
   */
  mergedFormIds: (existingForms, newForms) => {
    let resultArray = []
    existingForms.map((f) => {
      resultArray.push(f)
    })
    newForms.map((f) => {
      resultArray.push(parseInt(f))
    })
    return resultArray
  },
  assignFormsToWindow: async (checkWindowId, checkFormIds) => {
    return checkWindowDataService.sqlAssignFormsToWindow(checkWindowId, checkFormIds)
  },
  /**
   * Check if pupil is allowed to log in
   */

  hasActiveCheckWindow: async () => {
    const activeCheckWindows = await checkWindowDataService.sqlFindActiveCheckWindows()
    const hasActiveCheckWindows = activeCheckWindows && activeCheckWindows.length > 0
    if (!hasActiveCheckWindows) throw new Error('There is no open check window')
  }
}

module.exports = checkWindowService
