'use strict'
const moment = require('moment')
const dateService = require('../services/date.service')

const checkWindowPresenter = {}

/**
 * Shape check window data for the edit form view
 * @param {Object} checkWindowData
 * @param {Object} requestData
 * @returns {Object} Formatted check window data
 */
checkWindowPresenter.getViewModelData = (checkWindowData, requestData = {}) => {
  const currentDate = moment.utc()
  const checkWindowViewData = {
    adminStartDate: checkWindowData.adminStartDate,
    adminStartDateFormatted: dateService.formatFullGdsDate(checkWindowData.adminStartDate),
    adminStartDay: requestData.adminStartDay || checkWindowData.adminStartDate.format('D'),
    adminStartMonth: requestData.adminStartMonth || checkWindowData.adminStartDate.format('MM'),
    adminStartYear: requestData.adminStartYear || checkWindowData.adminStartDate.format('YYYY'),
    adminStartDateDisabled: currentDate.isAfter(checkWindowData.adminStartDate, 'days'),
    adminEndDate: checkWindowData.adminEndDate,
    adminEndDateFormatted: dateService.formatFullGdsDate(checkWindowData.adminEndDate),
    adminEndDay: requestData.adminEndDay || checkWindowData.adminEndDate.format('D'),
    adminEndMonth: requestData.adminEndMonth || checkWindowData.adminEndDate.format('MM'),
    adminEndYear: requestData.adminEndYear || checkWindowData.adminEndDate.format('YYYY'),
    adminEndDateDisabled: currentDate.isAfter(checkWindowData.adminEndDate, 'days'),
    checkWindowUrlSlug: checkWindowData.urlSlug,
    checkWindowName: checkWindowData.name,
    familiarisationCheckStartDate: checkWindowData.familiarisationCheckStartDate,
    familiarisationCheckStartDateFormatted: dateService.formatFullGdsDate(checkWindowData.familiarisationCheckStartDate),
    familiarisationCheckStartDay: requestData.familiarisationCheckStartDay || checkWindowData.familiarisationCheckStartDate.format('D'),
    familiarisationCheckStartMonth: requestData.familiarisationCheckStartMonth || checkWindowData.familiarisationCheckStartDate.format('MM'),
    familiarisationCheckStartYear: requestData.familiarisationCheckStartYear || checkWindowData.familiarisationCheckStartDate.format('YYYY'),
    familiarisationCheckStartDateDisabled: currentDate.isAfter(checkWindowData.familiarisationCheckStartDate, 'days'),
    familiarisationCheckEndDate: checkWindowData.familiarisationCheckEndDate,
    familiarisationCheckEndDateFormatted: dateService.formatFullGdsDate(checkWindowData.familiarisationCheckEndDate),
    familiarisationCheckEndDay: requestData.familiarisationCheckEndDay || checkWindowData.familiarisationCheckEndDate.format('D'),
    familiarisationCheckEndMonth: requestData.familiarisationCheckEndMonth || checkWindowData.familiarisationCheckEndDate.format('MM'),
    familiarisationCheckEndYear: requestData.familiarisationCheckEndYear || checkWindowData.familiarisationCheckEndDate.format('YYYY'),
    familiarisationCheckEndDateDisabled: currentDate.isAfter(checkWindowData.familiarisationCheckEndDate, 'days'),
    liveCheckStartDate: checkWindowData.checkStartDate,
    liveCheckStartDateFormatted: dateService.formatFullGdsDate(checkWindowData.checkStartDate),
    liveCheckStartDay: requestData.liveCheckStartDay || checkWindowData.checkStartDate.format('D'),
    liveCheckStartMonth: requestData.liveCheckStartMonth || checkWindowData.checkStartDate.format('MM'),
    liveCheckStartYear: requestData.liveCheckStartYear || checkWindowData.checkStartDate.format('YYYY'),
    liveCheckStartDateDisabled: currentDate.isAfter(checkWindowData.checkStartDate, 'days'),
    liveCheckEndDate: checkWindowData.checkEndDate,
    liveCheckEndDateFormatted: dateService.formatFullGdsDate(checkWindowData.checkEndDate),
    liveCheckEndDay: requestData.liveCheckEndDay || checkWindowData.checkEndDate.format('D'),
    liveCheckEndMonth: requestData.liveCheckEndMonth || checkWindowData.checkEndDate.format('MM'),
    liveCheckEndYear: requestData.liveCheckEndYear || checkWindowData.checkEndDate.format('YYYY'),
    liveCheckEndDateDisabled: currentDate.isAfter(checkWindowData.checkEndDate, 'days')
  }
  checkWindowViewData.adminPeriodDisabled = checkWindowViewData.adminStartDateDisabled && checkWindowViewData.adminEndDateDisabled
  checkWindowViewData.familiarisationCheckPeriodDisabled = checkWindowViewData.familiarisationCheckStartDateDisabled && checkWindowViewData.familiarisationCheckEndDateDisabled
  checkWindowViewData.liveCheckPeriodDisabled = checkWindowViewData.liveCheckStartDateDisabled && checkWindowViewData.liveCheckEndDateDisabled
  checkWindowViewData.pastCheckWindow = checkWindowViewData.adminPeriodDisabled && checkWindowViewData.familiarisationCheckPeriodDisabled && checkWindowViewData.liveCheckPeriodDisabled
  return checkWindowViewData
}

module.exports = checkWindowPresenter
