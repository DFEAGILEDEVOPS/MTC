'use strict'

const pinGenerationDataService = require('./data-access/pin-generation.data.service')
const pupilIdentificationFlagService = require('../services/pupil-identification-flag.service')

/**
 * Return a list of pupils who can have a pin generated
 * @param {number} schoolId
 * @return {Promise<*>}
 */
module.exports.getPupilsWhoCanHaveAPinGenerated = async function getPupilsWhoCanHaveAPinGenerated (schoolId) {
  const pupils = await pinGenerationDataService.sqlFindEligiblePupilsBySchool(schoolId)

  // Fix up the pupil names for the GUI
  const guiPupils = pupilIdentificationFlagService.addIdentificationFlags(pupils)

  return guiPupils
}

/**
 * Return a list of pupils who have an active pin - one that can be used to take a check
 * @param schoolId
 * @param pinEnv
 * @return {Promise<void>}
 */
module.exports.getPupilsWithActivePins = async function getPupilsWithActivePins (schoolId, pinEnv) {
  const pupils = await pinGenerationDataService.sqlFindPupilsWithActivePins(schoolId, pinEnv)

  // Fix up the pupil names for the GUI
  const guiPupils = pupilIdentificationFlagService.addIdentificationFlags(pupils)

  return guiPupils
}

