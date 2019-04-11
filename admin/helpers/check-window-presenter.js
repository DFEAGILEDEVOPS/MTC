'use strict'
const moment = require('moment')

const checkWindowPresenter = {}

/**
 * Shape check window data for the edit form view
 * @param {Object} checkWindowData
 * @param {Object} requestData
 * @returns {Object} Formatted check window data
 */
checkWindowPresenter.getViewModelData = (checkWindowData, requestData = {}) => {
  const currentDate = moment.utc()
  const adminStartDate = moment.utc(checkWindowData.adminStartDate)
  const adminEndDate = moment.utc(checkWindowData.adminEndDate)
  const familiarisationCheckStartDate = moment.utc(checkWindowData.familiarisationCheckStartDate)
  const familiarisationCheckEndDate = moment.utc(checkWindowData.familiarisationCheckEndDate)
  const checkStartDate = moment.utc(checkWindowData.checkStartDate)
  const checkEndDate = moment.utc(checkWindowData.checkEndDate)

  const checkWindowViewData = {
    adminStartDate: adminStartDate,
    adminStartDay: requestData.adminStartDay || adminStartDate.format('D'),
    adminStartMonth: requestData.adminStartMonth || adminStartDate.format('MM'),
    adminStartYear: requestData.adminStartYear || adminStartDate.format('YYYY'),
    adminStartDateDisabled: currentDate.isSameOrAfter(adminStartDate),
    adminEndDate: adminEndDate,
    adminEndDay: requestData.adminEndDay || adminEndDate.format('D'),
    adminEndMonth: requestData.adminEndMonth || adminEndDate.format('MM'),
    adminEndYear: requestData.adminEndYear || adminEndDate.format('YYYY'),
    adminEndDateDisabled: currentDate.isSameOrAfter(adminEndDate),
    checkWindowUrlSlug: checkWindowData.urlSlug,
    checkWindowName: checkWindowData.name,
    familiarisationCheckStartDate: familiarisationCheckStartDate,
    familiarisationCheckStartDay: requestData.familiarisationCheckStartDay || familiarisationCheckStartDate.format('D'),
    familiarisationCheckStartMonth: requestData.familiarisationCheckStartMonth || familiarisationCheckStartDate.format('MM'),
    familiarisationCheckStartYear: requestData.familiarisationCheckStartYear || familiarisationCheckStartDate.format('YYYY'),
    familiarisationCheckStartDateDisabled: currentDate.isSameOrAfter(familiarisationCheckStartDate),
    familiarisationCheckEndDate: familiarisationCheckEndDate,
    familiarisationCheckEndDay: requestData.familiarisationCheckEndDay || familiarisationCheckEndDate.format('D'),
    familiarisationCheckEndMonth: requestData.familiarisationCheckEndMonth || familiarisationCheckEndDate.format('MM'),
    familiarisationCheckEndYear: requestData.familiarisationCheckEndYear || familiarisationCheckEndDate.format('YYYY'),
    familiarisationCheckEndDateDisabled: currentDate.isSameOrAfter(familiarisationCheckEndDate),
    liveCheckStartDate: checkStartDate,
    liveCheckStartDay: requestData.liveCheckStartDay || checkStartDate.format('D'),
    liveCheckStartMonth: requestData.liveCheckStartMonth || checkStartDate.format('MM'),
    liveCheckStartYear: requestData.liveCheckStartYear || checkStartDate.format('YYYY'),
    liveCheckStartDateDisabled: currentDate.isSameOrAfter(checkStartDate),
    liveCheckEndDate: checkEndDate,
    liveCheckEndDay: requestData.liveCheckEndDay || checkEndDate.format('D'),
    liveCheckEndMonth: requestData.liveCheckEndMonth || checkEndDate.format('MM'),
    liveCheckEndYear: requestData.liveCheckEndYear || checkEndDate.format('YYYY'),
    liveCheckEndDateDisabled: currentDate.isSameOrAfter(checkEndDate)
  }
  checkWindowViewData.adminPeriodDisabled = checkWindowViewData.adminStartDateDisabled && checkWindowViewData.adminEndDateDisabled
  checkWindowViewData.familiarisationCheckPeriodDisabled = checkWindowViewData.familiarisationCheckStartDateDisabled && checkWindowViewData.familiarisationCheckEndDateDisabled
  checkWindowViewData.liveCheckPeriodDisabled = checkWindowViewData.liveCheckStartDateDisabled && checkWindowViewData.liveCheckEndDateDisabled
  checkWindowViewData.pastCheckWindow = checkWindowViewData.adminPeriodDisabled && checkWindowViewData.familiarisationCheckPeriodDisabled && checkWindowViewData.liveCheckPeriodDisabled
  return checkWindowViewData
}

module.exports = checkWindowPresenter
