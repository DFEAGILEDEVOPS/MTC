'use strict'

const moment = require('moment')

const config = require('../config')
const monitor = require('../helpers/monitor')

const schoolHomePinGenerationEligibilityPresenter = {}

/**
 * Fetch data for familiarisation and live pin generation eligibility
 * @param checkWindowData
 * @returns {Object} Eligibility data including flags and relevant datetimes
 */
schoolHomePinGenerationEligibilityPresenter.getPresentationData = async (checkWindowData) => {
  const overridePinGenerationEligibility = config.OverridePinExpiry
  const currentDate = moment.utc()
  const pinGenerationEligibilityData = {}
  const isWithinRestrictedHours = currentDate.hour() <= 8 || currentDate.hour() >= 16
  const isWithinFamiliarisationPeriod = currentDate.isAfter(checkWindowData.familiarisationCheckStartDate) && currentDate.isBefore(checkWindowData.familiarisationCheckEndDate)
  const isWithinLivePeriod = currentDate.isAfter(checkWindowData.checkStartDate) && currentDate.isBefore(checkWindowData.checkEndDate)
  // Familiarisation data
  pinGenerationEligibilityData.familiarisationCheckStartDate = checkWindowData.familiarisationCheckStartDate
  pinGenerationEligibilityData.familiarisationCheckEndDate = checkWindowData.familiarisationCheckEndDate
  pinGenerationEligibilityData.isFamiliarisationPinGenerationAllowed = (isWithinFamiliarisationPeriod && !isWithinRestrictedHours) || overridePinGenerationEligibility
  pinGenerationEligibilityData.isFamiliarisationInTheFuture = currentDate.isBefore(checkWindowData.familiarisationCheckStartDate)
  pinGenerationEligibilityData.isWithinFamiliarisationUnavailableHours = isWithinFamiliarisationPeriod && isWithinRestrictedHours
  // Live data
  pinGenerationEligibilityData.liveCheckStartDate = checkWindowData.checkStartDate
  pinGenerationEligibilityData.liveCheckEndDate = checkWindowData.checkEndDate
  pinGenerationEligibilityData.isLivePinGenerationAllowed = (isWithinLivePeriod && !isWithinRestrictedHours) || overridePinGenerationEligibility
  pinGenerationEligibilityData.isLiveInTheFuture = currentDate.isBefore(checkWindowData.checkStartDate)
  pinGenerationEligibilityData.isWithinLiveUnavailableHours = isWithinLivePeriod && isWithinRestrictedHours

  return pinGenerationEligibilityData
}

module.exports = monitor('school-home-pin-generation-eligibility-presenter.', schoolHomePinGenerationEligibilityPresenter)
