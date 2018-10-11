'use strict'

const checkWindowDataService = require('./data-access/check-window.data.service')
const monitor = require('../helpers/monitor')

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

module.exports = monitor('check-window-v2.service', checkWindowV2Service)
