'use strict'

const moment = require('moment')

const config = require('../config')
const dateService = require('../services/date.service')

const schoolHomeFeatureEligibilityPresenter = {}

/**
 * Fetch data for familiarisation and live pin generation eligibility
 * @param checkWindowData
 * @returns {Object} Eligibility data including flags and relevant datetimes
 */
schoolHomeFeatureEligibilityPresenter.getPresentationData = async (checkWindowData) => {
  const overridePinGenerationEligibility = config.OverridePinExpiry
  const currentDate = moment.utc()
  const featureEligibilityData = {}
  const isWithinOpeningHours = currentDate.hour() >= 8 && currentDate.hour() < 16
  const isWithinFamiliarisationPeriod = currentDate.isAfter(checkWindowData.familiarisationCheckStartDate) && currentDate.isBefore(checkWindowData.familiarisationCheckEndDate)
  const isWithinLivePeriod = currentDate.isAfter(checkWindowData.checkStartDate) && currentDate.isBefore(checkWindowData.checkEndDate)
  // Familiarisation data
  featureEligibilityData.familiarisationCheckStartDate = dateService.formatFullGdsDate(checkWindowData.familiarisationCheckStartDate)
  featureEligibilityData.familiarisationCheckEndDate = dateService.formatFullGdsDate(checkWindowData.familiarisationCheckEndDate)
  featureEligibilityData.isFamiliarisationPinGenerationAllowed = (isWithinFamiliarisationPeriod && isWithinOpeningHours) || overridePinGenerationEligibility
  featureEligibilityData.isFamiliarisationInTheFuture = currentDate.isBefore(checkWindowData.familiarisationCheckStartDate)
  featureEligibilityData.isWithinFamiliarisationUnavailableHours = isWithinFamiliarisationPeriod && !isWithinOpeningHours
  // Live data
  featureEligibilityData.liveCheckStartDate = dateService.formatFullGdsDate(checkWindowData.checkStartDate)
  featureEligibilityData.liveCheckEndDate = dateService.formatFullGdsDate(checkWindowData.checkEndDate)
  featureEligibilityData.isLivePinGenerationAllowed = (isWithinLivePeriod && isWithinOpeningHours) || overridePinGenerationEligibility
  featureEligibilityData.isLiveInTheFuture = currentDate.isBefore(checkWindowData.checkStartDate)
  featureEligibilityData.isWithinLiveUnavailableHours = isWithinLivePeriod && !isWithinOpeningHours
  // Restarts
  featureEligibilityData.isRestartsPageAccessible = isWithinLivePeriod
  // Groups
  featureEligibilityData.isGroupsPageAccessible = isWithinLivePeriod
  // Results page data
  const resultsPageEligibilityDateTime = checkWindowData.checkEndDate.add(3, 'days').set({ hour: 8, minutes: 0, seconds: 0 })

  featureEligibilityData.isResultsPageAccessible = currentDate.isSameOrAfter(resultsPageEligibilityDateTime)
  featureEligibilityData.resultsPublishedDate = dateService.formatFullGdsDate(resultsPageEligibilityDateTime)

  return featureEligibilityData
}

module.exports = schoolHomeFeatureEligibilityPresenter
