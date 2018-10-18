'use strict'

const moment = require('moment')
const monitor = require('../helpers/monitor')
const validate = require('uuid-validate')

const checkWindowDataService = require('./data-access/check-window.data.service')

const checkWindowV2Service = {}

/**
 * Get check window based on urlSlug
 * @param {String} urlSlug
 * @returns {Object|Error} Check window object or error object
 */
checkWindowV2Service.getCheckWindow = async (urlSlug) => {
  if (!urlSlug || !validate(urlSlug)) {
    throw new Error('Check window url slug is not valid')
  }
  return checkWindowDataService.sqlFindOneByUrlSlug(urlSlug)
}

/**
 * Get all check windows recorded in the database with their status
 * @returns {Array} List of check windows
 */
checkWindowV2Service.getCheckWindows = async () => {
  const checkWindows = await checkWindowDataService.sqlFindCheckWindowsWithStatus()
  checkWindows.forEach(cw => (cw.canRemove = cw.status === 'Inactive'))
  return checkWindows
}

/**
 * Mark check window as deleted based on url slug
 * @param {String} urlSlug
 * @returns {Object|Error} Either a successful message or throws an exception
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
 * Fetch check window data for the edit form
 * @param {String} urlSlug
 * @returns {Object|Error} Either a successful message or throws an exception
 */
checkWindowV2Service.getCheckWindowEditData = async (urlSlug) => {
  const checkWindow = await checkWindowV2Service.getCheckWindow(urlSlug)
  const currentDate = moment.utc()
  return {
    adminStartDate: checkWindow.adminStartDate,
    adminStartDay: checkWindow.adminStartDate.format('D'),
    adminStartMonth: checkWindow.adminStartDate.format('MM'),
    adminStartYear: checkWindow.adminStartDate.format('YYYY'),
    adminStartDateDisabled: currentDate.isSameOrAfter(checkWindow.adminStartDate),
    adminEndDate: checkWindow.adminEndDate,
    adminEndDay: checkWindow.adminEndDate.format('D'),
    adminEndMonth: checkWindow.adminEndDate.format('MM'),
    adminEndYear: checkWindow.adminEndDate.format('YYYY'),
    adminEndDateDisabled: currentDate.isSameOrAfter(checkWindow.adminEndDate),
    checkWindowUrlSlug: checkWindow.urlSlug,
    checkWindowName: checkWindow.name,
    familiarisationCheckStartDate: checkWindow.familiarisationCheckStartDate,
    familiarisationCheckStartDay: checkWindow.familiarisationCheckStartDate.format('D'),
    familiarisationCheckStartMonth: checkWindow.familiarisationCheckStartDate.format('MM'),
    familiarisationCheckStartYear: checkWindow.familiarisationCheckStartDate.format('YYYY'),
    familiarisationCheckStartDateDisabled: currentDate.isSameOrAfter(checkWindow.familiarisationCheckStartDate),
    familiarisationCheckEndDate: checkWindow.familiarisationCheckEndDate,
    familiarisationCheckEndDay: checkWindow.familiarisationCheckEndDate.format('D'),
    familiarisationCheckEndMonth: checkWindow.familiarisationCheckEndDate.format('MM'),
    familiarisationCheckEndYear: checkWindow.familiarisationCheckEndDate.format('YYYY'),
    familiarisationCheckEndDateDisabled: currentDate.isSameOrAfter(checkWindow.familiarisationCheckEndDate),
    liveCheckStartDate: checkWindow.checkStartDate,
    liveCheckStartDay: checkWindow.checkStartDate.format('D'),
    liveCheckStartMonth: checkWindow.checkStartDate.format('MM'),
    liveCheckStartYear: checkWindow.checkStartDate.format('YYYY'),
    liveCheckStartDateDisabled: currentDate.isSameOrAfter(checkWindow.checkStartDate),
    liveCheckEndDate: checkWindow.checkEndDate,
    liveCheckEndDay: checkWindow.checkEndDate.format('D'),
    liveCheckEndMonth: checkWindow.checkEndDate.format('MM'),
    liveCheckEndYear: checkWindow.checkEndDate.format('YYYY'),
    liveCheckEndDateDisabled: currentDate.isSameOrAfter(checkWindow.checkEndDate)
  }
}

module.exports = monitor('check-window-v2.service', checkWindowV2Service)
