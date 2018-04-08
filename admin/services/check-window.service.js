'use strict'

const moment = require('moment')
const R = require('ramda')
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
    const pastCheckWindows = []
    const newCheckWindows = []
    checkWindows.map(cw => {
      const adminStartDate = moment(cw.adminStartDate)
      const checkStartDate = moment(cw.checkStartDate)
      const checkEndDate = moment(cw.checkEndDate)

      if (checkStartDate.isAfter(checkEndDate)) {
        throw new Error('Check start date is after check end date')
      }

      const isPast = moment(checkEndDate).isBefore(moment.now())
      const isCurrent = moment(checkStartDate).isSameOrBefore(moment.now()) && moment(checkEndDate).isSameOrAfter(moment.now())
      const isFuture = moment(checkStartDate).isAfter(moment.now())

      const checkWindow = {
        id: cw.id,
        name: cw.name,
        adminStartDate: adminStartDate.format('D MMM YYYY'),
        checkDates: dateService.formatCheckPeriod(checkStartDate, checkEndDate),
        isPast
      }

      if (isPast) {
        checkWindow.canRemove = false
        pastCheckWindows.push(checkWindow)
      }
      if (isCurrent) {
        checkWindow.canRemove = false
        newCheckWindows.push(checkWindow)
      }
      if (isFuture) {
        checkWindow.canRemove = true
        newCheckWindows.push(checkWindow)
      }
    })

    return R.concat(newCheckWindows, pastCheckWindows)
  },

  /**
   * Format unsaved data
   * @param {Object} requestData
   * @returns {Object}
   */
  formatUnsavedData: (requestData) => {
    if (!requestData['adminStartDay'] && !requestData['adminStartMonth'] && !requestData['adminStartYear'] && requestData['existingAdminStartDate'] && requestData['adminIsDisabled']) {
      requestData.adminStartDay = requestData['existingAdminStartDate'].format('D')
      requestData.adminStartMonth = requestData['existingAdminStartDate'].format('MM')
      requestData.adminStartYear = requestData['existingAdminStartDate'].format('YYYY')
    }

    if (!requestData['checkStartDay'] && !requestData['checkStartMonth'] && !requestData['checkStartYear'] && requestData['existingCheckStartDate'] && requestData['checkStartIsDisabled']) {
      requestData.checkStartDay = requestData['existingCheckStartDate'].format('D')
      requestData.checkStartMonth = requestData['existingCheckStartDate'].format('MM')
      requestData.checkStartYear = requestData['existingCheckStartDate'].format('YYYY')
    }
    return requestData
  },

  /**
   * Save check window
   * @param {Object} requestData
   */
  save: async(requestData) => {
    let checkWindow
    if (requestData.checkWindowId) {
      checkWindow = await checkWindowDataService.sqlFindOneById(requestData.checkWindowId)
    }
    if (!checkWindow) {
      checkWindow = {}
    }

    checkWindow.name = requestData['checkWindowName']
    if (requestData['adminStartDay'] && requestData['adminStartMonth'] && requestData['adminStartYear']) {
      checkWindow.adminStartDate =
        dateService.createLocalTimeFromDayMonthYear(requestData['adminStartDay'], requestData['adminStartMonth'], requestData['adminStartYear'])
    }
    if (requestData['checkStartDay'] && requestData['checkStartMonth'] && requestData['checkStartYear']) {
      checkWindow.checkStartDate =
        dateService.createLocalTimeFromDayMonthYear(requestData['checkStartDay'], requestData['checkStartMonth'], requestData['checkStartYear'])
    }
    checkWindow.checkEndDate =
      dateService.createLocalTimeFromDayMonthYear(requestData['checkEndDay'], requestData['checkEndMonth'], requestData['checkEndYear'])
    // Ensure check end date time is set to the last minute of the particular day
    checkWindow.checkEndDate.set({ hour: 23, minute: 59, second: 59 })
    if (!checkWindow.id) {
      await checkWindowDataService.sqlCreate(checkWindow)
    } else {
      await checkWindowDataService.sqlUpdate(checkWindow)
    }
  },

  /**
   * Mark check window as deleted
   * @param {Object} id
   * @returns {Object}
   */
  markDeleted: async(id) => {
    const checkWindow = await checkWindowDataService.sqlFindOneById(id)
    if (!checkWindow) {
      throw new Error('Checkwindow for deletion not found')
    }
    if (checkWindow.checkStartDate.isBefore(moment.now()) && checkWindow.checkEndDate.isAfter(moment.now())) {
      return {
        type: 'error',
        message: 'Deleting an active check window is not allowed.'
      }
    } else {
      await checkWindowDataService.sqlDeleteCheckWindow(id)
      return {
        type: 'info',
        message: 'Check window deleted.'
      }
    }
  }
}

module.exports = checkWindowService
