'use strict'

const moment = require('moment')
const monitor = require('../helpers/monitor')
const checkWindowDataService = require('./data-access/check-window.data.service')

const checkWindowV2Service = {}

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
 * @returns {Object|Error} Either a successful message or throws an exception
 */
checkWindowV2Service.markDeleted = async (urlSlug) => {
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
  } else {
    await checkWindowDataService.sqlDeleteCheckWindow(checkWindow.id)
    return {
      type: 'info',
      message: 'Check window deleted.'
    }
  }
}

module.exports = monitor('check-window-v2.service', checkWindowV2Service)
