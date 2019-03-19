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
 * Determine if pin generation is allowed
 * @param {Boolean} isLiveCheck
 * @param {Object} checkWindowData
 * @throws Will throw an error if isPinGenerationAllowed method returns false
 */
businessAvailabilityService.determinePinGenerationEligibility = (isLiveCheck, checkWindowData, timezone) => {
  const isPinGenerationAllowed = businessAvailabilityService.isPinGenerationAllowed(isLiveCheck, checkWindowData, timezone)
  const pinEnv = isLiveCheck ? 'Live' : 'Familiarisation'
  if (!isPinGenerationAllowed) {
    throw new Error(`${pinEnv} pin generation is not allowed`)
  }
}

/**
 * Retuns data for the avalibilty partial
 * @param {Number} dfeNumber
 * @param {Object} checkWindowData
 * @returns {Object}
 */
businessAvailabilityService.getAvailabilityData = async (dfeNumber, checkWindowData, timezone) => {
  const currentDate = moment.tz(timezone || config.DEFAULT_TIMEZONE)
  const hdfSubmitted = await headteacherDeclarationService.isHdfSubmittedForCheck(dfeNumber, checkWindowData.id)
  const checkWindowClosed = currentDate.isAfter(checkWindowData.checkEndDate)
  const checkWindowYear = dateService.formatYear(checkWindowData.checkEndDate)
  const available = !hdfSubmitted && !checkWindowClosed
  return {
    checkWindowClosed,
    checkWindowYear,
    hdfSubmitted,
    available
  }
}

module.exports = businessAvailabilityService
