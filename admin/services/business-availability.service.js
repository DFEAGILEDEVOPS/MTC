'use strict'

const schoolHomeFeatureEligibilityPresenter = require('../helpers/school-home-feature-eligibility-presenter')

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

module.exports = businessAvailabilityService
