'use strict'

const pupilIdentificationFlagService = require('../services/pupil-identification-flag.service')
const restartDataService = require('./data-access/restart-v2.data.service')

/**
 * Find pupils who are eligible for a restart
 * @param {number} schoolId
 * @return {Promise<*>}
 */
module.exports.getPupilsEligibleForRestart = async function getPupilsEligibleForRestart (schoolId) {
  const pupils = await restartDataService.sqlFindPupilsEligibleForRestart(schoolId)

  // Fix up the pupil names for the GUI
  const guiPupils = pupilIdentificationFlagService.addIdentificationFlags(pupils)

  return guiPupils
}
