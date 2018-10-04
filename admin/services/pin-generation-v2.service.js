'use strict'

const pinGenerationDataService = require('./data-access/pin-generation.data.service')
const pupilIdentificationFlagService = require('../services/pupil-identification-flag.service')
const monitor = require('../helpers/monitor')

/**
 * Return a list of pupils who can have a pin generated
 * @param {number} schoolId
 * @return {Promise<*>}
 */
const serviceToExport = {
  /**
   * Return a list of pupils who can have a pin generated
   * TODO: add pinEnv
   * @param schoolId
   * @return {Promise<*>}
   */
  getPupilsEligibleForPinGeneration: async function getPupilsEligibleForPinGeneration (schoolId) {
    const pupils = await pinGenerationDataService.sqlFindEligiblePupilsBySchool(schoolId)

    // Fix up the pupil names for the GUI
    const guiPupils = pupilIdentificationFlagService.addIdentificationFlags(pupils)

    return guiPupils
  },

  /**
   * Return a list of pupils who have an active pin - one that can be used to take a check
   * TODO: add pinEnv
   * @param schoolId
   * @param pinEnv
   * @return {Promise<void>}
   */
  getPupilsWithActivePins: async function getPupilsWithActivePins (schoolId, pinEnv) {
    const pupils = await pinGenerationDataService.sqlFindPupilsWithActivePins(schoolId, pinEnv)

    // Fix up the pupil names for the GUI
    const guiPupils = pupilIdentificationFlagService.addIdentificationFlags(pupils)

    return guiPupils
  }
}

module.exports = monitor('pin-generation-v2-service', serviceToExport)
