'use strict'

const checkWindowDataService = require('./data-access/check-window.data.service')
const checkWindowAddValidator = require('../lib/validator/check-window-v2/check-window-add-validator')
const checkWindowHelper = require('../helpers/check-window')
const checkWindowV2Service = require('./check-window-v2.service')
const monitor = require('../helpers/monitor')

const checkWindowV2UpdateService = {}

/**
 * Submit request data on updating
 * @param {Object} requestData
 * @returns {String} flash message for successful db insertion
 */
checkWindowV2UpdateService.submit = async (requestData) => {
  const validationError = checkWindowAddValidator.validate(requestData)
  if (validationError.hasError()) {
    throw validationError
  }
  const checkWindow = await checkWindowV2Service.getCheckWindow(requestData.checkWindowUrlSlug)
  const checkWindowData = checkWindowHelper.prepareSubmissionData(requestData, checkWindow.id)
  await checkWindowDataService.sqlUpdate(checkWindowData)
  return `${checkWindowData.name} has been edited`
}

module.exports = monitor('check-window-update.service', checkWindowV2UpdateService)
