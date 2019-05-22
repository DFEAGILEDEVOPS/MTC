'use strict'

const moment = require('moment-timezone')
const config = require('../config')
const schoolHomeFeatureEligibilityPresenter = require('../helpers/school-home-feature-eligibility-presenter')
const dateService = require('../services/date.service')
const headteacherDeclarationService = require('../services/headteacher-declaration.service')

const businessAvailabilityService = {}

/**
 * Return pin generation availability
 * @param {Boolean} isLiveCheck
 * @param {Object} checkWindowData
 * @returns {Boolean} live pin generation allowance
 * @throws Will throw an error if the argument passed is not boolean type
 */
businessAvailabilityService.isPinGenerationAllowed = (isLiveCheck, checkWindowData, timezone) => {
  const pinGenerationEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(checkWindowData, timezone)
  if (isLiveCheck) {
    return pinGenerationEligibilityData.isLivePinGenerationAllowed
  } else {
    return pinGenerationEligibilityData.isFamiliarisationPinGenerationAllowed
  }
}

/**
 * Return restarts availability
 * @param {Object} checkWindowData
 * @returns {Boolean} live pin generation allowance
 * @throws Will throw an error if the argument passed is not boolean type
 */
businessAvailabilityService.areRestartsAllowed = (checkWindowData, timezone) => {
  const pinGenerationEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(checkWindowData, timezone)
  return pinGenerationEligibilityData.isRestartsPageAccessible
}

/**
 * Return groups availability
 * @param {Object} checkWindowData
 * @returns {Boolean} groups allowance
 */
businessAvailabilityService.areGroupsAllowed = (checkWindowData) => {
  const pinGenerationEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(checkWindowData)
  return pinGenerationEligibilityData.isGroupsPageAccessible
}

/**
 * Return access arrangements availability
 * @param {Object} checkWindowData
 * @returns {Boolean} groups allowance
 */
businessAvailabilityService.areAccessArrangementsAllowed = (checkWindowData) => {
  const pinGenerationEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(checkWindowData)
  return pinGenerationEligibilityData.isAccessArrangementsPageAccessible
}

/**
 * Determine if pin generation is allowed
 * @param {Boolean} isLiveCheck
 * @param {Object} checkWindowData
 * @throws Will throw an error if isPinGenerationAllowed method returns false
 */
businessAvailabilityService.determinePinGenerationEligibility = (isLiveCheck, checkWindowData, timezone) => {
  const isPinGenerationAllowed = businessAvailabilityService.isPinGenerationAllowed(isLiveCheck, checkWindowData, timezone)
  const pinEnv = isLiveCheck ? 'Live' : 'Familiarisation'
  if (!isPinGenerationAllowed && !config.OVERRIDE_AVAILABILITY_CHECKS) {
    throw new Error(`${pinEnv} pin generation is not allowed`)
  }
}

/**
 * Determine if restarts are permitted
 * @param {Object} checkWindowData
 * @throws Will throw an error if areRestartsAllowed is false
 */
businessAvailabilityService.determineRestartsEligibility = (checkWindowData) => {
  const areRestartsAllowed = businessAvailabilityService.areRestartsAllowed(checkWindowData)
  if (!areRestartsAllowed && !config.OVERRIDE_AVAILABILITY_CHECKS) {
    throw new Error(`Restarts are not allowed`)
  }
}

/**
 * Determine if groups are permitted
 * @param {Object} checkWindowData
 * @throws Will throw an error if areGroupsAllowed is false
 */
businessAvailabilityService.determineGroupsEligibility = (checkWindowData) => {
  const areGroupsAllowed = businessAvailabilityService.areGroupsAllowed(checkWindowData)
  if (!areGroupsAllowed && !config.OVERRIDE_AVAILABILITY_CHECKS) {
    throw new Error(`Groups are not allowed`)
  }
}

/**
 * Determine if groups are permitted
 * @param {Object} checkWindowData
 * @throws Will throw an error if areGroupsAllowed is false
 */
businessAvailabilityService.determineAccessArrangementsEligibility = (checkWindowData) => {
  const areAccessArrangementsAllowed = businessAvailabilityService.areAccessArrangementsAllowed(checkWindowData)
  if (!areAccessArrangementsAllowed && !config.OVERRIDE_AVAILABILITY_CHECKS) {
    throw new Error(`Access Arrangements are not allowed`)
  }
}

/**
 * Returns data for the availability partial
 * @param {Number} schoolID
 * @param {Object} checkWindowData
 * @param timezone
 * @returns {Object}
 */
businessAvailabilityService.getAvailabilityData = async (schoolID, checkWindowData, timezone) => {
  const currentDate = moment.tz(timezone || config.DEFAULT_TIMEZONE)
  const isWithinOpeningHours = currentDate.hour() >= 8 && currentDate.hour() < 16
  const hdfSubmitted = await headteacherDeclarationService.isHdfSubmittedForCheck(schoolID, checkWindowData.id)
  const familiarisationWindowStarted = currentDate.isAfter(checkWindowData.familiarisationCheckStartDate)
  const familiarisationWindowClosed = currentDate.isAfter(checkWindowData.familiarisationCheckEndDate)
  const checkWindowStarted = currentDate.isAfter(checkWindowData.checkStartDate)
  const checkWindowClosed = currentDate.isAfter(checkWindowData.checkEndDate)
  const checkWindowYear = dateService.formatYear(checkWindowData.checkEndDate)
  const adminWindowStarted = currentDate.isAfter(checkWindowData.adminStartDate)
  const adminWindowClosed = currentDate.isAfter(checkWindowData.adminEndDate)
  const canEditArrangements = (!hdfSubmitted && !checkWindowClosed) || config.OVERRIDE_AVAILABILITY_CHECKS
  const restartsAvailable = (!hdfSubmitted && checkWindowStarted && !checkWindowClosed) || config.OVERRIDE_AVAILABILITY_CHECKS
  const livePinsAvailable = (!hdfSubmitted && checkWindowStarted && !checkWindowClosed && isWithinOpeningHours) || config.OverridePinExpiry
  const familiarisationPinsAvailable = (!hdfSubmitted && familiarisationWindowStarted && !familiarisationWindowClosed && isWithinOpeningHours) || config.OverridePinExpiry
  const groupsAvailable = !checkWindowClosed || config.OVERRIDE_AVAILABILITY_CHECKS
  const accessArrangementsAvailable = businessAvailabilityService.areAccessArrangementsAllowed(checkWindowData)
  const hdfAvailable = currentDate.isBetween(checkWindowData.checkStartDate, checkWindowData.adminEndDate)
  return {
    familiarisationWindowStarted,
    familiarisationWindowClosed,
    checkWindowStarted,
    checkWindowClosed,
    checkWindowYear,
    adminWindowStarted,
    adminWindowClosed,
    hdfAvailable,
    hdfSubmitted,
    canEditArrangements,
    restartsAvailable,
    livePinsAvailable,
    familiarisationPinsAvailable,
    groupsAvailable,
    accessArrangementsAvailable
  }
}

module.exports = businessAvailabilityService
