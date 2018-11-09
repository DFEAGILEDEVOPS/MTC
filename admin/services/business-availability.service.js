'use strict'

const checkWindowV2Service = require('./check-window-v2.service')
const schoolHomePinGenerationEligibilityPresenter = require('../helpers/school-home-pin-generation-eligibility-presenter')

const businessAvailabilityService = {}

/**
 * Return pin generation availability
 * @param {Boolean} isLiveCheck
 * @returns {Boolean} live pin generation allowance
 * @throws Will throw an error if the argument passed is not boolean type
 */
businessAvailabilityService.isPinGenerationAllowed = async (isLiveCheck) => {
  const checkWindowData = await checkWindowV2Service.getActiveCheckWindow()
  const pinGenerationEligibilityData = await schoolHomePinGenerationEligibilityPresenter.getPresentationData(checkWindowData)
  if (isLiveCheck) {
    return pinGenerationEligibilityData.isLivePinGenerationAllowed
  } else {
    return pinGenerationEligibilityData.isFamiliarisationPinGenerationAllowed
  }
}

/**
 * Determine if pin generation is allowed
 * @param {Boolean} isLiveCheck
 * @throws Will throw an error if isPinGenerationAllowed method returns false
 */
businessAvailabilityService.determinePinGenerationEligibility = async (isLiveCheck) => {
  const isPinGenerationAllowed = await businessAvailabilityService.isPinGenerationAllowed(isLiveCheck)
  const pinEnv = isLiveCheck ? 'Live' : 'Familiarisation'
  if (!isPinGenerationAllowed) {
    throw new Error(`${pinEnv} pin generation is not allowed`)
  }
}

module.exports = businessAvailabilityService
