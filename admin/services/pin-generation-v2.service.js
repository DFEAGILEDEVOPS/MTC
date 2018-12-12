'use strict'
const R = require('ramda')
const winston = require('winston')

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
   * TODO: add pinEnv
   * @param schoolId
   * @return {Promise<*>}
   */
  getPupilsEligibleForPinGeneration: async function getPupilsEligibleForPinGeneration (schoolId, isLiveCheck) {
    const pupils = await pinGenerationDataService.sqlFindEligiblePupilsBySchool(schoolId, isLiveCheck)

    // Fix up the pupil names for the GUI
    const guiPupils = pupilIdentificationFlagService.addIdentificationFlags(pupils)

    return guiPupils
  },

  /**
   * Return a list of pupils who have an active pin - one that can be used to take a check
   * @param {number} schoolId
   * @param {boolean} isLiveCheck
   * @return {Promise<void>}
   */
  getPupilsWithActivePins: async function getPupilsWithActivePins (schoolId, isLiveCheck) {
    const pupils = await pinGenerationDataService.sqlFindPupilsWithActivePins(schoolId, isLiveCheck)

    // Fix up the pupil names for the GUI
    const guiPupils = pupilIdentificationFlagService.addIdentificationFlags(pupils)

    return guiPupils
  },

  /**
   * Takes a list of pupil IDs and retrieves them from the pupilsEligibleForPinGeneration view
   * - useful for validation on incoming params from the GUI
   * - it adds restart information
   * @param schoolId
   * @param pupilIds
   * @param {boolean} isLiveCheck - flag to indicate if the check is a live check (true) or a familiarisation check (false)
   * @return {Promise<*>}
   */
  getPupilsEligibleForPinGenerationById: async function getPupilsEligibleForPinGenerationById (schoolId, pupilIds, isLiveCheck) {
    return pinGenerationDataService.sqlFindPupilsEligibleForPinGenerationById(schoolId, pupilIds, isLiveCheck)
  },

  /**
   * Update the pupilRestart table when generating a restart check with the ID of the new Check
   * This "consumes" the restart, so it can't be used again
   * @param pupils
   * @param newCheckIds
   */
  checkAndUpdateRestarts: async function (schoolId, pupils, newCheckIds) {
    const pupilsDoingARestart = R.filter(R.propEq('isRestart', true), pupils)
    if (R.isEmpty(pupilsDoingARestart)) {
      winston.info('No pupils doing a restart')
      return
    }

    // Retrieve the newly-created checks by ID
    let restartChecks = []
    try {
      restartChecks = await pinGenerationDataService.sqlFindChecksForPupilsById(schoolId, newCheckIds, pupilsDoingARestart.map(p => p.id))
    } catch (error) {
      winston.error('checkAndUpdateRestarts(): failed to find checks for pupils: ' + error.message)
      throw error
    }

    const updateData = pupilsDoingARestart.map(p => {
      const restart = restartChecks.find(r => r.pupil_id === p.id)
      return { pupilRestartId: p.pupilRestart_id, checkId: restart.id }
    })

    try {
      await pinGenerationDataService.updatePupilRestartsWithCheckInformation(updateData)
    } catch (error) {
      winston.error('checkAndUpdateRestarts() Failed to update restarts: ' + console.message)
      throw error
    }
  }
}

module.exports = serviceToExport
