'use strict'

const moment = require('moment')
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
businessAvailabilityService.isPinGenerationAllowed = (isLiveCheck, checkWindowData) => {
  const pinGenerationEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(checkWindowData)
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
businessAvailabilityService.areRestartsAllowed = (checkWindowData) => {
  const pinGenerationEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(checkWindowData)
  return pinGenerationEligibilityData.isRestartsPageAccessible
}

/**
 * Determine if pin generation is allowed
 * @param {Boolean} isLiveCheck
 * @param {Object} checkWindowData
 * @throws Will throw an error if isPinGenerationAllowed method returns false
 */
businessAvailabilityService.determinePinGenerationEligibility = (isLiveCheck, checkWindowData) => {
  const isPinGenerationAllowed = businessAvailabilityService.isPinGenerationAllowed(isLiveCheck, checkWindowData)
  const pinEnv = isLiveCheck ? 'Live' : 'Familiarisation'
  if (!isPinGenerationAllowed) {
    throw new Error(`${pinEnv} pin generation is not allowed`)
  }
}

/**
 * Returns data for the availability partial
 * @param {Number} dfeNumber
 * @param {Object} checkWindowData
 * @returns {Object}
 */
businessAvailabilityService.getAvailabilityData = async (dfeNumber, checkWindowData) => {
  const currentDate = moment.utc()
  const hdfSubmitted = await headteacherDeclarationService.isHdfSubmittedForCheck(dfeNumber, checkWindowData.id)
  const checkWindowStarted = currentDate.isAfter(checkWindowData.checkStartDate)
  const checkWindowClosed = currentDate.isAfter(checkWindowData.checkEndDate)
  const checkWindowYear = dateService.formatYear(checkWindowData.checkEndDate)
  const adminWindowStarted = currentDate.isAfter(checkWindowData.adminStartDate)
  const adminWindowClosed = currentDate.isAfter(checkWindowData.adminEndDate)
  const canEditArrangements = !hdfSubmitted && !checkWindowClosed
  const pinsRestartsAvailable = !hdfSubmitted && checkWindowStarted && !checkWindowClosed
  return {
    checkWindowStarted,
    checkWindowClosed,
    checkWindowYear,
    adminWindowStarted,
    adminWindowClosed,
    hdfSubmitted,
    canEditArrangements,
    pinsRestartsAvailable
  }
}

module.exports = businessAvailabilityService
