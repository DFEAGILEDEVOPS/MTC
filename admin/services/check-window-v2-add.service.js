'use strict'

const checkWindowDataService = require('./data-access/check-window.data.service')
const checkWindowAddValidator = require('../lib/validator/check-window-v2/check-window-add-validator')
const dateService = require('../services/date.service')
const monitor = require('../helpers/monitor')

const checkWindowV2AddService = {}

/**
 * Submit request data on adding
 * @param {Object} requestData
 * @returns {String} flash message for successful db insertion
 */
checkWindowV2AddService.submit = async (requestData) => {
  const validationError = checkWindowAddValidator.validate(requestData)
  if (validationError.hasError()) {
    throw validationError
  }
  const checkWindowData = checkWindowV2AddService.processData(requestData)
  await checkWindowDataService.sqlCreate(checkWindowData)
  return `${checkWindowData.name} has been created`
}

/**
 * Submit request data on adding
 * @param {Object} requestData
 * @returns {Object} checkWindowData - processed data for submission
 */
checkWindowV2AddService.processData = (requestData) => {
  const checkWindowData = {}
  checkWindowData.name = requestData.checkWindowName
  checkWindowData.adminStartDate =
    dateService.createUTCFromDayMonthYear(
      requestData['adminStartDay'],
      requestData['adminStartMonth'],
      requestData['adminStartYear']
    )
  checkWindowData.adminEndDate =
    dateService.createUTCFromDayMonthYear(
      requestData['adminEndDay'],
      requestData['adminEndMonth'],
      requestData['adminEndYear']
    )
  checkWindowData.familiarisationCheckStartDate =
    dateService.createUTCFromDayMonthYear(
      requestData['familiarisationCheckStartDay'],
      requestData['familiarisationCheckStartMonth'],
      requestData['familiarisationCheckStartYear']
    )
  checkWindowData.familiarisationCheckEndDate =
    dateService.createUTCFromDayMonthYear(
      requestData['familiarisationCheckEndDay'],
      requestData['familiarisationCheckEndMonth'],
      requestData['familiarisationCheckEndYear']
    )
  checkWindowData.checkStartDate =
    dateService.createUTCFromDayMonthYear(
      requestData['liveCheckStartDay'],
      requestData['liveCheckStartMonth'],
      requestData['liveCheckStartYear']
    )
  checkWindowData.checkEndDate =
    dateService.createUTCFromDayMonthYear(
      requestData['liveCheckEndDay'],
      requestData['liveCheckEndMonth'],
      requestData['liveCheckEndYear']
    )
  checkWindowData.checkEndDate.set({ hour: 22, minute: 59, second: 59 })
  checkWindowData.familiarisationCheckEndDate.set({ hour: 22, minute: 59, second: 59 })
  return checkWindowData
}

module.exports = monitor('check-window-add.service', checkWindowV2AddService)
