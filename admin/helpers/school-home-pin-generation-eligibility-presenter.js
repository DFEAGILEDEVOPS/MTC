'use strict'

const moment = require('moment')

const checkWindowV2Service = require('../services/check-window-v2.service')
const config = require('../config')
const monitor = require('../helpers/monitor')

const schoolHomePinGenerationEligibilityPresenter = {}

/**
 * Fetch data for familiarisation and live pin generation eligibility
 * @returns {Object} Eligibility data including flags and relevant datetimes
 */
schoolHomePinGenerationEligibilityPresenter.getPresentationData = async () => {
  const checkWindow = await checkWindowV2Service.getActiveCheckWindow()
  const overridePinGenerationEligibility = config.OverridePinExpiry
  const currentDate = moment.utc()
  const pinGenerationEligibilityData = {}
  const isUnavailableTime = currentDate.hour() < 8 || currentDate.hour() > 16
  const isWithinFamiliarisationPeriod = currentDate.isAfter(checkWindow.familiarisationCheckStartDate) && currentDate.isBefore(checkWindow.familiarisationCheckEndDate)
  const isWithinLivePeriod = currentDate.isAfter(checkWindow.checkStartDate) && currentDate.isBefore(checkWindow.checkEndDate)
  // Familiarisation data
  pinGenerationEligibilityData.familiarisationCheckStartDate = checkWindow.familiarisationCheckStartDate
  pinGenerationEligibilityData.familiarisationCheckEndDate = checkWindow.familiarisationCheckEndDate
  pinGenerationEligibilityData.isFamiliarisationPinGenerationAllowed = (isWithinFamiliarisationPeriod && !isUnavailableTime) || overridePinGenerationEligibility
  pinGenerationEligibilityData.isFamiliarisationInTheFuture = currentDate.isBefore(checkWindow.familiarisationCheckStartDate)
  pinGenerationEligibilityData.isWithinFamiliarisationUnavailableHours = isWithinFamiliarisationPeriod && isUnavailableTime
  // Live data
  pinGenerationEligibilityData.liveCheckStartDate = checkWindow.checkStartDate
  pinGenerationEligibilityData.liveCheckEndDate = checkWindow.checkEndDate
  pinGenerationEligibilityData.isLivePinGenerationAllowed = (isWithinLivePeriod && !isUnavailableTime) || overridePinGenerationEligibility
  pinGenerationEligibilityData.isLiveInTheFuture = currentDate.isBefore(checkWindow.checkStartDate)
  pinGenerationEligibilityData.isWithinLiveUnavailableHours = isWithinLivePeriod && isUnavailableTime

  return pinGenerationEligibilityData
}

module.exports = monitor('school-home-pin-generation-eligibility-presenter.', schoolHomePinGenerationEligibilityPresenter)
