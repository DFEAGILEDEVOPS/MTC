'use strict'

const moment = require('moment-timezone')

const config = require('../config')
const dateService = require('../services/date.service')

const schoolHomeFeatureEligibilityPresenter = {}

/**
 * Fetch data for familiarisation and live pin generation eligibility
 * @param checkWindowData
 * @param timezone
 * @returns {Object} Eligibility data including flags and relevant datetimes
 */
schoolHomeFeatureEligibilityPresenter.getPresentationData = (checkWindowData, timezone) => {
  const currentDate = moment.tz(timezone || config.DEFAULT_TIMEZONE)
  const featureEligibilityData = {}
  const resultsPublishedDate = checkWindowData.checkEndDate.clone()
    .add(1, 'weeks').isoWeekday('Monday')
    .utcOffset(currentDate.utcOffset(), true)
    .set({ hour: 6, minutes: 0, seconds: 0 })

  // Pin generation
  featureEligibilityData.familiarisationCheckStartDate = dateService.formatFullGdsDate(checkWindowData.familiarisationCheckStartDate)
  featureEligibilityData.familiarisationCheckEndDate = dateService.formatFullGdsDate(checkWindowData.familiarisationCheckEndDate)
  featureEligibilityData.liveCheckStartDate = dateService.formatFullGdsDate(checkWindowData.checkStartDate)
  featureEligibilityData.liveCheckEndDate = dateService.formatFullGdsDate(checkWindowData.checkEndDate)

  // Results
  featureEligibilityData.resultsPublishedDate = dateService.formatFullGdsDate(resultsPublishedDate)

  // TODO: logic related properties should get refactored into services
  featureEligibilityData.isFamiliarisationPinGenerationAllowed = schoolHomeFeatureEligibilityPresenter.isFamiliarisationPinGenerationAllowed(currentDate, checkWindowData)
  featureEligibilityData.isFamiliarisationInTheFuture = schoolHomeFeatureEligibilityPresenter.isFamiliarisationInTheFuture(currentDate, checkWindowData)
  featureEligibilityData.isWithinFamiliarisationUnavailableHours = schoolHomeFeatureEligibilityPresenter.isWithinFamiliarisationUnavailableHours(currentDate, checkWindowData)

  featureEligibilityData.isLivePinGenerationAllowed = schoolHomeFeatureEligibilityPresenter.isLivePinGenerationAllowed(currentDate, checkWindowData)
  featureEligibilityData.isLiveInTheFuture = schoolHomeFeatureEligibilityPresenter.isLiveInTheFuture(currentDate, checkWindowData)
  featureEligibilityData.isWithinLiveUnavailableHours = schoolHomeFeatureEligibilityPresenter.isWithinLiveUnavailableHours(currentDate, checkWindowData)

  // Restarts
  featureEligibilityData.isRestartsPageAccessible = schoolHomeFeatureEligibilityPresenter.isRestartsPageAccessible(currentDate, checkWindowData)

  // Groups
  featureEligibilityData.isGroupsPageAccessible = schoolHomeFeatureEligibilityPresenter.isGroupsPageAccessible(currentDate, checkWindowData)

  // Access Arrangements
  featureEligibilityData.isAccessArrangementsPageAccessible = schoolHomeFeatureEligibilityPresenter.isAccessArrangementsPageAccessible(currentDate, checkWindowData)

  // HDF
  featureEligibilityData.isHdfPageAccessible = schoolHomeFeatureEligibilityPresenter.isHdfPageAccessible(currentDate, checkWindowData)

  return featureEligibilityData
}

/**
 * Determine if current date is within live period
 * @param currentDate
 * @param checkWindowData
 * @returns {Boolean}
 */
schoolHomeFeatureEligibilityPresenter.isWithinLivePeriod = (currentDate, checkWindowData) => {
  return currentDate.isBetween(checkWindowData.checkStartDate, checkWindowData.checkEndDate)
}

/**
 * Determine if familiarisation pin generation is allowed
 * @param currentDate
 * @param checkWindowData
 * @returns {Boolean}
 */
schoolHomeFeatureEligibilityPresenter.isFamiliarisationPinGenerationAllowed = (currentDate, checkWindowData) => {
  const isWithinFamiliarisationPeriod = currentDate.isAfter(checkWindowData.familiarisationCheckStartDate) && currentDate.isBefore(checkWindowData.familiarisationCheckEndDate)
  const isWithinOpeningHours = currentDate.hour() >= 8 && currentDate.hour() < 16
  const overridePinGenerationEligibility = config.OverridePinExpiry
  return (isWithinFamiliarisationPeriod && isWithinOpeningHours) || overridePinGenerationEligibility
}

/**
 * Determine if familiarisation occurs in a future date
 * @param currentDate
 * @param checkWindowData
 * @returns {Boolean}
 */
schoolHomeFeatureEligibilityPresenter.isFamiliarisationInTheFuture = (currentDate, checkWindowData) => {
  return currentDate.isBefore(checkWindowData.familiarisationCheckStartDate)
}

/**
 * Determine if current datetime is within unavailable hours of familiarisation pin generation
 * @param currentDate
 * @param checkWindowData
 * @returns {Boolean}
 */
schoolHomeFeatureEligibilityPresenter.isWithinFamiliarisationUnavailableHours = (currentDate, checkWindowData) => {
  const isWithinFamiliarisationPeriod = currentDate.isAfter(checkWindowData.familiarisationCheckStartDate) && currentDate.isBefore(checkWindowData.familiarisationCheckEndDate)
  const isWithinOpeningHours = currentDate.hour() >= 8 && currentDate.hour() < 16
  return isWithinFamiliarisationPeriod && !isWithinOpeningHours
}

/**
 * Determine if live pin generation is allowed
 * @param currentDate
 * @param checkWindowData
 * @returns {Boolean}
 */
schoolHomeFeatureEligibilityPresenter.isLivePinGenerationAllowed = (currentDate, checkWindowData) => {
  const isWithinLivePeriod = currentDate.isAfter(checkWindowData.checkStartDate) && currentDate.isBefore(checkWindowData.checkEndDate)
  const isWithinOpeningHours = currentDate.hour() >= 8 && currentDate.hour() < 16
  const overridePinGenerationEligibility = config.OverridePinExpiry
  return (isWithinLivePeriod && isWithinOpeningHours) || overridePinGenerationEligibility
}

/**
 * Determine if live occurs in a future date
 * @param currentDate
 * @param checkWindowData
 * @returns {Boolean}
 */
schoolHomeFeatureEligibilityPresenter.isLiveInTheFuture = (currentDate, checkWindowData) => {
  return currentDate.isBefore(checkWindowData.checkStartDate)
}

/**
 * Determine if current datetime is within unavailable hours of live pin generation
 * @param currentDate
 * @param checkWindowData
 * @returns {Boolean}
 */
schoolHomeFeatureEligibilityPresenter.isWithinLiveUnavailableHours = (currentDate, checkWindowData) => {
  const isWithinLivePeriod = currentDate.isAfter(checkWindowData.checkStartDate) && currentDate.isBefore(checkWindowData.checkEndDate)
  const isWithinOpeningHours = currentDate.hour() >= 8 && currentDate.hour() < 16
  return isWithinLivePeriod && !isWithinOpeningHours
}

/**
 * Determine if restarts page is accessible
 * @param currentDate
 * @param checkWindowData
 * @returns {Boolean}
 */
schoolHomeFeatureEligibilityPresenter.isRestartsPageAccessible = (currentDate, checkWindowData) => {
  return schoolHomeFeatureEligibilityPresenter.isWithinLivePeriod(currentDate, checkWindowData)
}

/**
 * Determine if groups page is accessible
 * @param currentDate
 * @param checkWindowData
 * @returns {Boolean}
 */
schoolHomeFeatureEligibilityPresenter.isGroupsPageAccessible = (currentDate, checkWindowData) => {
  return currentDate.isBetween(checkWindowData.adminStartDate, checkWindowData.checkEndDate)
}

/**
 * Determine if access arragements page is accessible
 * @param currentDate
 * @param checkWindowData
 * @returns {Boolean}
 */
schoolHomeFeatureEligibilityPresenter.isAccessArrangementsPageAccessible = (currentDate, checkWindowData) => {
  return currentDate.isBetween(checkWindowData.adminStartDate, checkWindowData.checkEndDate)
}

/**
 * Determine if hdf page is accessible
 * @param currentDate
 * @param checkWindowData
 * @returns {Boolean}
 */
schoolHomeFeatureEligibilityPresenter.isHdfPageAccessible = (currentDate, checkWindowData) => {
  return currentDate.isBetween(checkWindowData.checkStartDate, checkWindowData.adminEndDate)
}

module.exports = schoolHomeFeatureEligibilityPresenter
