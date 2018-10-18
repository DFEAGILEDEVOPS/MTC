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

module.exports = monitor('check-window-v2.service', checkWindowV2Service)
