'use strict'

const moment = require('moment-timezone')

const config = require('../config')
const dateService = require('../services/date.service')

const schoolHomeFeatureEligibilityPresenter = {}

/**
 * Determine the results earliest eligibility date when hdf has been submitted
 * @param currentDate
 * @param checkEndDate
 * @returns {Object} moment date object
 */
schoolHomeFeatureEligibilityPresenter.resultsPageEligibilityDateTimeForSubmittedHdfs = (currentDate, checkEndDate) => {
  return checkEndDate.clone()
    .add(1, 'weeks').isoWeekday('Monday')
    // first converting the date to the local compared date before setting the opening hour
    .utcOffset(currentDate.utcOffset(), true)
    .set({ hour: 8, minutes: 0, seconds: 0 })
}

/**
 * Determine the results earliest eligibility date when hdf has not been submitted
 * @param currentDate
 * @param checkEndDate
 * @returns {Object} moment date object
 */
schoolHomeFeatureEligibilityPresenter.resultsPageEligibilityDateTimeForUnsubmittedHdfs = (currentDate, checkEndDate) => {
  return checkEndDate.clone()
    .add(2, 'weeks').isoWeekday('Monday')
    .utcOffset(currentDate.utcOffset(), true)
    .set({ hour: 8, minutes: 0, seconds: 0 })
}

/**
 * Fetch data for familiarisation and live pin generation eligibility
 * @param checkWindowData
 * @returns {Object} Eligibility data including flags and relevant datetimes
 */
schoolHomeFeatureEligibilityPresenter.getPresentationData = (checkWindowData, timezone) => {
  const currentDate = moment.tz(timezone || config.DEFAULT_TIMEZONE)
  const featureEligibilityData = {}
  const resultsPageEligibilityDateTimeForSubmittedHdfs = schoolHomeFeatureEligibilityPresenter.resultsPageEligibilityDateTimeForSubmittedHdfs(currentDate, checkWindowData.checkEndDate)

  // Pin generation
  featureEligibilityData.familiarisationCheckStartDate = dateService.formatFullGdsDate(checkWindowData.familiarisationCheckStartDate)
  featureEligibilityData.familiarisationCheckEndDate = dateService.formatFullGdsDate(checkWindowData.familiarisationCheckEndDate)
  featureEligibilityData.liveCheckStartDate = dateService.formatFullGdsDate(checkWindowData.checkStartDate)
  featureEligibilityData.liveCheckEndDate = dateService.formatFullGdsDate(checkWindowData.checkEndDate)

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

  // Results page data
  featureEligibilityData.resultsPublishedDate = dateService.formatFullGdsDate(resultsPageEligibilityDateTimeForSubmittedHdfs)
  featureEligibilityData.isResultFeatureAccessible = schoolHomeFeatureEligibilityPresenter.isResultsFeatureAccessible(currentDate, checkWindowData)

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

/**
 * Determine if results feature is accessible
 * @param currentDate
 * @param checkWindowData
 * @returns {Boolean}
 */
schoolHomeFeatureEligibilityPresenter.isResultsFeatureAccessible = (currentDate, checkWindowData) => {
  const resultsPageEligibilityDateTimeForSubmittedHdfs = schoolHomeFeatureEligibilityPresenter.resultsPageEligibilityDateTimeForSubmittedHdfs(currentDate, checkWindowData.checkEndDate)
  return currentDate.isSameOrAfter(resultsPageEligibilityDateTimeForSubmittedHdfs)
}

/**
 * Determine if results page is accessible while taking into account if the user has submitted the hdf
 * @param currentDate
 * @param checkWindowData
 * @param isHdfSubmitted
 * @returns {Boolean}
 */
schoolHomeFeatureEligibilityPresenter.isResultsPageAccessibleForSubmittedHdfs = (currentDate, checkWindowData, isHdfSubmitted = false) => {
  return schoolHomeFeatureEligibilityPresenter.isResultsFeatureAccessible(currentDate, checkWindowData) && isHdfSubmitted
}

/**
 * Determine if results page is accessible providing the user did not submit the hdf
 * @param currentDate
 * @param checkWindowData
 * @param isHdfSubmitted
 * @returns {Boolean}
 */
schoolHomeFeatureEligibilityPresenter.isResultsPageAccessibleForUnsubmittedHdfs = (currentDate, checkWindowData, isHdfSubmitted = false) => {
  const resultsPageEligibilityDateTimeForSubmittedHdfs = schoolHomeFeatureEligibilityPresenter.resultsPageEligibilityDateTimeForUnsubmittedHdfs(currentDate, checkWindowData.checkEndDate)
  return currentDate.isSameOrAfter(resultsPageEligibilityDateTimeForSubmittedHdfs) && !isHdfSubmitted
}

module.exports = schoolHomeFeatureEligibilityPresenter
