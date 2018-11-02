'use strict'

const moment = require('moment')

const checkWindowV2Service = require('../services/check-window-v2.service')
const config = require('../config')
const monitor = require('../helpers/monitor')

const schoolHomePinGenerationEligibilityPresenter = {}

/**
 * Fetch data for familiarisation and live pin generation eligibility
 * @returns {Object} Eligibility data including flags and datetimes for revelant periods
 */
schoolHomePinGenerationEligibilityPresenter.getEligibilityData = async () => {
  const checkWindow = await checkWindowV2Service.getActiveCheckWindow()
  const overridePinGenerationEligibility = config.OverridePinExpiry
  const currentDate = moment.utc()
  return {
    familiarisationCheckStartDate: checkWindow.familiarisationCheckStartDate,
    familiarisationCheckEndDate: checkWindow.familiarisationCheckEndDate,
    liveCheckStartDate: checkWindow.checkStartDate,
    liveCheckEndDate: checkWindow.checkEndDate,
    isFamiliarisationPeriodActive: currentDate.isAfter(checkWindow.familiarisationCheckStartDate) && currentDate.isBefore(checkWindow.familiarisationCheckEndDate),
    isFamiliarisationPinGenerationAllowed: (currentDate.isAfter(checkWindow.adminStartDate) && currentDate.isBefore(checkWindow.familiarisationCheckStartDate)) || overridePinGenerationEligibility,
    isLivePeriodActive: currentDate.isAfter(checkWindow.checkStartDate) && currentDate.isBefore(checkWindow.checkEndDate),
    isLivePinGenerationAllowed: (currentDate.isAfter(checkWindow.adminStartDate) && currentDate.isBefore(checkWindow.checkStartDate)) || overridePinGenerationEligibility,
    isPinGenerationInTheFuture: currentDate.isBefore(checkWindow.adminStartDate),
    isUnavailableTime: currentDate.hour() < 8 || currentDate.hour() > 16
  }
}

module.exports = monitor('school-home-pin-generation-eligibility-presenter.', schoolHomePinGenerationEligibilityPresenter)
