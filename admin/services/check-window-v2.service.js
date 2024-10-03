'use strict'

const moment = require('moment')
const R = require('ramda')
const validate = require('uuid-validate')

const MtcCheckWindowNotFoundError = require('../error-types/MtcCheckWindowNotFoundError')
const dateService = require('./date.service')
const checkWindowDataService = require('./data-access/check-window.data.service')
const checkWindowV2Service = {}

/**
 * Get check window based on urlSlug
 * @param {String} urlSlug
 * @returns {Promise<object|Error>} Check window object or error
 * object
 */
checkWindowV2Service.getCheckWindow = async (urlSlug) => {
  if (!urlSlug || !validate(urlSlug)) {
    throw new MtcCheckWindowNotFoundError('Check window url slug is not valid')
  }
  return checkWindowDataService.sqlFindOneByUrlSlug(urlSlug)
}

/**
 * @typedef {object} CheckWindowData
 * @property {number} id
 * @property {Date} createdAt
 * @property {Date} updatedAt
 * @property {object} version
 * @property {string} name
 * @property {Date} adminStartDate
 * @property {Date} adminEndDate
 * @property {Date} checkStartDate
 * @property {Date} checkEndDate
 * @property {boolean} isDeleted
 * @property {string} urlSlug
 * @property {Date} familiarisationCheckStartDate
 * @property {Date} familiarisationCheckEndDate
 */

let cachedActiveCheckWindow
let cachedActiveCheckWindowExpiresAt

/**
 * Get active check window
 * @returns {Promise<CheckWindowData>} Check window object
 */
checkWindowV2Service.getActiveCheckWindow = async (cacheBust = false) => {
  const now = Date.now()
  const nodeEnv = process.env.NODE_ENV
  if (nodeEnv !== 'production') {
    // don't cache unless its production
    cacheBust = true
  }

  if (cacheBust || !cachedActiveCheckWindow || !cachedActiveCheckWindowExpiresAt || now > cachedActiveCheckWindowExpiresAt) {
    cachedActiveCheckWindow = await checkWindowDataService.sqlFindActiveCheckWindow()
    cachedActiveCheckWindowExpiresAt = Date.now() + (60 * 1000) // +60 seconds
  }

  return cachedActiveCheckWindow
}

/**
 * Get latest check window
 * @returns {Promise<Object>} Check window object
 */
checkWindowV2Service.getLatestCheckWindow = async () => {
  return checkWindowDataService.sqlFindLatestCheckWindow()
}

/**
 * Get all check windows recorded in the database with their status
 * @returns {Promise<Array>} List of check windows
 */
checkWindowV2Service.getCheckWindows = async () => {
  const checkWindows = await checkWindowDataService.sqlFindCheckWindowsWithStatus()
  checkWindows.forEach(cw => (cw.canRemove = cw.status === 'Inactive'))
  return checkWindows
}

/**
 * Get present and future check windows
 * @returns {Promise<Array>} List of check windows
 */
checkWindowV2Service.getPresentAndFutureCheckWindows = async () => {
  const checkWindows = await checkWindowDataService.sqlFindCheckWindowsWithStatusAndFormCountByType()
  return R.reject(R.propEq('Past', 'status'), checkWindows)
}

/**
 * Mark check window as deleted based on url slug
 * @param {String} urlSlug
 * @returns {Promise<Object|Error>} Either a successful message or throws an exception
 */
checkWindowV2Service.markDeleted = async (urlSlug) => {
  if (!urlSlug || !validate(urlSlug)) {
    throw new Error('Check window url slug is not valid')
  }
  const currentUTCTimestamp = moment.utc()
  const checkWindow = await checkWindowDataService.sqlFindOneByUrlSlug(urlSlug)
  if (!checkWindow) {
    throw new Error('Check window not found')
  }
  if (checkWindow.adminEndDate.isBefore(currentUTCTimestamp)) {
    throw new Error('Deleting an past check window is not permitted')
  }
  if (checkWindow.adminStartDate.isSameOrBefore(currentUTCTimestamp) && checkWindow.adminEndDate.isSameOrAfter(currentUTCTimestamp)) {
    throw new Error('Deleting an active check window is not permitted')
  }
  return checkWindowDataService.sqlDeleteCheckWindow(checkWindow.id)
}

/**
 * Prepare validated data for submission
 * @param {Object} requestData
 * @param {Number} checkWindowId
 * @returns {Object} Formatted check window data
 */
checkWindowV2Service.prepareSubmissionData = (requestData, checkWindowId = null) => {
  const checkWindowData = {}
  if (checkWindowId) {
    checkWindowData.id = checkWindowId
  }
  checkWindowData.name = requestData.checkWindowName
  checkWindowData.adminStartDate =
    dateService.createUTCFromDayMonthYear(
      requestData.adminStartDay,
      requestData.adminStartMonth,
      requestData.adminStartYear
    )
  checkWindowData.adminEndDate =
    dateService.createUTCFromDayMonthYear(
      requestData.adminEndDay,
      requestData.adminEndMonth,
      requestData.adminEndYear
    )
  checkWindowData.familiarisationCheckStartDate =
    dateService.createUTCFromDayMonthYear(
      requestData.familiarisationCheckStartDay,
      requestData.familiarisationCheckStartMonth,
      requestData.familiarisationCheckStartYear
    )
  checkWindowData.familiarisationCheckEndDate =
    dateService.createUTCFromDayMonthYear(
      requestData.familiarisationCheckEndDay,
      requestData.familiarisationCheckEndMonth,
      requestData.familiarisationCheckEndYear
    )
  checkWindowData.checkStartDate =
    dateService.createUTCFromDayMonthYear(
      requestData.liveCheckStartDay,
      requestData.liveCheckStartMonth,
      requestData.liveCheckStartYear
    )
  checkWindowData.checkEndDate =
    dateService.createUTCFromDayMonthYear(
      requestData.liveCheckEndDay,
      requestData.liveCheckEndMonth,
      requestData.liveCheckEndYear
    )
  // This will ensure the last day of the check window will be taken into account for checks
  // To avoid overflow to the next day during BST the time is set at 1 hour 59mins and 59 seconds before the day change
  const endofDayTime = { hour: 23, minute: 59, second: 59 }
  checkWindowData.adminEndDate.set(endofDayTime)
  checkWindowData.checkEndDate.set(endofDayTime)
  checkWindowData.familiarisationCheckEndDate.set(endofDayTime)
  return checkWindowData
}

module.exports = checkWindowV2Service
