'use strict'

const schoolHomePinGenerationEligibilityPresenter = require('../helpers/school-home-pin-generation-eligibility-presenter')
const monitor = require('../helpers/monitor')

const pinGenerationEligibilityService = {}

/**
 * Return pin generation availability
 * @param pinEnv live or familiarisation
 * @returns {Boolean | Error} live pin generation allowance
 */
pinGenerationEligibilityService.isPinGenerationAllowed = async (pinEnv) => {
  if (!pinEnv) {
    throw new Error('pin environment variable not detected')
  }
  const pinGenerationEligibilityData = await schoolHomePinGenerationEligibilityPresenter.getEligibilityData()
  if (pinEnv === 'live') {
    return pinGenerationEligibilityData.isLivePinGenerationAllowed
  } else {
    return pinGenerationEligibilityData.isFamiliarisationPinGenerationAllowed
  }
}

/**
 * Determine if pin generation is allowed
 * @param pinEnv live or familiarisation
 * @returns {Boolean} live pin generation allowance
 */
pinGenerationEligibilityService.determinePinGenerationEligibility = async (pinEnv) => {
  const isPinGenerationAllowed = await pinGenerationEligibilityService.isPinGenerationAllowed(pinEnv)
  if (!isPinGenerationAllowed) {
    throw new Error(`${pinEnv} pin generation is not allowed`)
  }
}

module.exports = monitor('pin-generation-eligibility-service', pinGenerationEligibilityService)
