'use strict'
const moment = require('moment')

const dateService = require('../services/date.service')
const monitor = require('./monitor')

const checkWindowHelper = {}

/**
 * Shape check window data for the edit form
 * @param {Object} checkWindowData
 * @returns {Object} Formatted check window data
 */
checkWindowHelper.getEditViewData = (checkWindowData) => {
  const currentDate = moment.utc()
  const checkWindowViewData = {
    adminStartDate: checkWindowData.adminStartDate,
    adminStartDay: checkWindowData.adminStartDate.format('D'),
    adminStartMonth: checkWindowData.adminStartDate.format('MM'),
    adminStartYear: checkWindowData.adminStartDate.format('YYYY'),
    adminStartDateDisabled: currentDate.isSameOrAfter(checkWindowData.adminStartDate),
    adminEndDate: checkWindowData.adminEndDate,
    adminEndDay: checkWindowData.adminEndDate.format('D'),
    adminEndMonth: checkWindowData.adminEndDate.format('MM'),
    adminEndYear: checkWindowData.adminEndDate.format('YYYY'),
    adminEndDateDisabled: currentDate.isSameOrAfter(checkWindowData.adminEndDate),
    checkWindowUrlSlug: checkWindowData.urlSlug,
    checkWindowName: checkWindowData.name,
    familiarisationCheckStartDate: checkWindowData.familiarisationCheckStartDate,
    familiarisationCheckStartDay: checkWindowData.familiarisationCheckStartDate.format('D'),
    familiarisationCheckStartMonth: checkWindowData.familiarisationCheckStartDate.format('MM'),
    familiarisationCheckStartYear: checkWindowData.familiarisationCheckStartDate.format('YYYY'),
    familiarisationCheckStartDateDisabled: currentDate.isSameOrAfter(checkWindowData.familiarisationCheckStartDate),
    familiarisationCheckEndDate: checkWindowData.familiarisationCheckEndDate,
    familiarisationCheckEndDay: checkWindowData.familiarisationCheckEndDate.format('D'),
    familiarisationCheckEndMonth: checkWindowData.familiarisationCheckEndDate.format('MM'),
    familiarisationCheckEndYear: checkWindowData.familiarisationCheckEndDate.format('YYYY'),
    familiarisationCheckEndDateDisabled: currentDate.isSameOrAfter(checkWindowData.familiarisationCheckEndDate),
    liveCheckStartDate: checkWindowData.checkStartDate,
    liveCheckStartDay: checkWindowData.checkStartDate.format('D'),
    liveCheckStartMonth: checkWindowData.checkStartDate.format('MM'),
    liveCheckStartYear: checkWindowData.checkStartDate.format('YYYY'),
    liveCheckStartDateDisabled: currentDate.isSameOrAfter(checkWindowData.checkStartDate),
    liveCheckEndDate: checkWindowData.checkEndDate,
    liveCheckEndDay: checkWindowData.checkEndDate.format('D'),
    liveCheckEndMonth: checkWindowData.checkEndDate.format('MM'),
    liveCheckEndYear: checkWindowData.checkEndDate.format('YYYY'),
    liveCheckEndDateDisabled: currentDate.isSameOrAfter(checkWindowData.checkEndDate),
  }
  checkWindowViewData.adminPeriodDisabled = checkWindowViewData.adminStartDateDisabled && checkWindowViewData.adminEndDateDisabled
  checkWindowViewData.familiarisationPeriodDisabled = checkWindowViewData.familiarisationCheckStartDateDisabled && checkWindowViewData.familiarisationCheckEndDateDisabled
  checkWindowViewData.livePeriodDisabled = checkWindowViewData.liveCheckStartDateDisabled && checkWindowViewData.liveCheckEndDateDisabled
  checkWindowViewData.pastCheckWindow = checkWindowViewData.adminPeriodDisabled && checkWindowViewData.familiarisationPeriodDisabled && checkWindowViewData.livePeriodDisabled
  return checkWindowViewData
}

/**
 * Prepare validated data for submission
 * @param {Object} requestData
 * @param {Number} checkWindowId
 * @returns {Object} Formatted check window data
 */
checkWindowHelper.prepareSubmissionData = (requestData, checkWindowId = null) => {
  const checkWindowData = {}
  if (checkWindowId) {
    checkWindowData.id = checkWindowId
  }
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

module.exports = monitor('check-window', checkWindowHelper)
