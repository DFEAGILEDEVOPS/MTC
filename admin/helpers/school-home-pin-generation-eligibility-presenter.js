'use strict'

const moment = require('moment')

const config = require('../config')

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
  const isWithinOpeningHours = currentDate.hour() > 8 && currentDate.hour() < 16
  const isWithinFamiliarisationPeriod = currentDate.isAfter(checkWindowData.familiarisationCheckStartDate) && currentDate.isBefore(checkWindowData.familiarisationCheckEndDate)
  const isWithinLivePeriod = currentDate.isAfter(checkWindowData.checkStartDate) && currentDate.isBefore(checkWindowData.checkEndDate)
  // Familiarisation data
  pinGenerationEligibilityData.familiarisationCheckStartDate = checkWindowData.familiarisationCheckStartDate
  pinGenerationEligibilityData.familiarisationCheckEndDate = checkWindowData.familiarisationCheckEndDate
  pinGenerationEligibilityData.isFamiliarisationPinGenerationAllowed = (isWithinFamiliarisationPeriod && isWithinOpeningHours) || overridePinGenerationEligibility
  pinGenerationEligibilityData.isFamiliarisationInTheFuture = currentDate.isBefore(checkWindowData.familiarisationCheckStartDate)
  pinGenerationEligibilityData.isWithinFamiliarisationUnavailableHours = isWithinFamiliarisationPeriod && !isWithinOpeningHours
  // Live data
  pinGenerationEligibilityData.liveCheckStartDate = checkWindowData.checkStartDate
  pinGenerationEligibilityData.liveCheckEndDate = checkWindowData.checkEndDate
  pinGenerationEligibilityData.isLivePinGenerationAllowed = (isWithinLivePeriod && isWithinOpeningHours) || overridePinGenerationEligibility
  pinGenerationEligibilityData.isLiveInTheFuture = currentDate.isBefore(checkWindowData.checkStartDate)
  pinGenerationEligibilityData.isWithinLiveUnavailableHours = isWithinLivePeriod && !isWithinOpeningHours

  return pinGenerationEligibilityData
}

module.exports = schoolHomePinGenerationEligibilityPresenter
