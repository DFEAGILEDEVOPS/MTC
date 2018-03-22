'use strict'

const moment = require('moment')
const checkWindowDataService = require('./data-access/check-window.data.service')
const dateService = require('../services/date.service')
const checkFormDataService = require('./data-access/check-form.data.service')
const checkDataService = require('./data-access/check.data.service')

const checkWindowService = {

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
    let checkWindowsListData = await checkWindowDataService.sqlFindCurrentAndFutureWithFormCount()
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
   * @param pupilId
   * @returns {Object}
   */

  getActiveCheckWindow: async (pupilId) => {
    const currentCheck = await checkDataService.sqlFindOneForPupilLogin(pupilId)
    if (!currentCheck) throw new Error(`There is no check record for pupil id ${pupilId}`)
    const activeCheckWindow = await checkWindowDataService.sqlFindOneActiveCheckWindow(currentCheck.checkWindow_id)
    if (!activeCheckWindow) throw new Error('There is no open check window')
    return activeCheckWindow
  },

  /**
   * Get all check windows
   * @param {String} sortField
   * @param {String} sortDirection
   * @returns {Object}
   */
  getAllCheckWindows: async(sortField, sortDirection) => {
    // fetch past current and future check windows
    const checkWindows = await checkWindowDataService.sqlFindAllCheckWindows(sortField, sortDirection)
    return checkWindows.map(cw => {
      const adminStartDate = moment(cw.adminStartDate)
      const checkStartDate = moment(cw.checkStartDate)
      const checkEndDate = moment(cw.checkEndDate)

      if (moment(checkStartDate).isAfter(moment(checkEndDate))) {
        throw new Error('Check start date is after check end date')
      }

      const inPast = moment(checkEndDate).isBefore(moment.now())
      const isCurrent = moment(checkStartDate).isSameOrBefore(moment.now()) && moment(checkEndDate).isSameOrAfter(moment.now())
      const inFuture = moment(checkStartDate).isAfter(moment.now())

      let canRemove
      if (inPast) canRemove = false
      if (isCurrent) canRemove = false
      if (inFuture) canRemove = true

      return {
        id: cw.id,
        name: cw.name,
        adminStartDate: adminStartDate.format('D MMM YYYY'),
        checkDates: dateService.formatCheckPeriod(checkStartDate, checkEndDate),
        isCurrent,
        canRemove
      }
    })
  }
}

module.exports = checkWindowService
