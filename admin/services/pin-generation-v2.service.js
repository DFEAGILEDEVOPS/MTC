'use strict'
const pinGenerationDataService = require('./data-access/pin-generation.data.service')
const pupilIdentificationFlagService = require('../services/pupil-identification-flag.service')

/**
 * Return a list of pupils who can have a pin generated
 * @param {number} schoolId
 * @return {Promise<*>}
 */
const serviceToExport = {
  /**
   * Return a list of pupils who can have a pin generated
   * @param schoolId
   * @return {Promise<*>}
   */
  getPupilsEligibleForPinGeneration: async function getPupilsEligibleForPinGeneration (schoolId, isLiveCheck) {
    const pupils = await pinGenerationDataService.sqlFindEligiblePupilsBySchool(schoolId, isLiveCheck)
    return pupilIdentificationFlagService.sortAndAddIdentificationFlags(pupils)
  },

  /**
   * Return a list of pupils who have an active pin - one that can be used to take a check
   * @param {number} schoolId
   * @param {boolean} isLiveCheck
   * @return {Promise<Array<any>>}
   */
  getPupilsWithActivePins: async function getPupilsWithActivePins (schoolId, isLiveCheck) {
    const pupils = await pinGenerationDataService.sqlFindPupilsWithActivePins(schoolId, isLiveCheck)
    if (pupils.length === 0) { return pupils }
    // Pupil disambiguation for the user/gui
    return pupilIdentificationFlagService.sortAndAddIdentificationFlags(pupils)
  }
}

module.exports = serviceToExport
