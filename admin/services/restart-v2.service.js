'use strict'

const pupilIdentificationFlagService = require('../services/pupil-identification-flag.service')
const restartDataService = require('./data-access/restart-v2.data.service')
const config = require('../config')
const R = require('ramda')

/**
 * Find pupils who are eligible for a restart
 * @param {number} schoolId
 * @return {Promise<*>}
 */
module.exports.getPupilsEligibleForRestart = async function getPupilsEligibleForRestart (schoolId) {
  const pupils = await restartDataService.sqlFindPupilsEligibleForRestart(schoolId)
  // Fix up the pupil names for the GUI
  return pupilIdentificationFlagService.sortAndAddIdentificationFlags(pupils)
}

/**
 * Find restart for a particular school
 * @param schoolId
 * @returns {Promise<import('../services/pupil-identification-flag.service').IdentifiedPupil[]>}
 */
module.exports.getRestartsForSchool = async function getRestartsForSchool (schoolId) {
  const restarts = await restartDataService.getRestartsForSchool(schoolId)
  const restartsWithStatus = restarts.map(r => {
    const update = {
      totalCheckCount: R.isNil(r.totalCheckCount) ? 0 : r.totalCheckCount,
      status: ''
    }

    // if all restarts used and no discretionary restart available...
    if ((r.totalCheckCount >= config.RESTART_MAX_ATTEMPTS + 1) && !r.isDiscretionaryRestartAvailable) {
      update.status = 'Maximum number of restarts taken'
      // if a pin has been generated against the restart...
    } else if (r.restartCheckId !== null) {
      update.status = 'Restart taken'
    // if discretionary restart available or else pupil has logged in to the restart check...
    } else if (r.isDiscretionaryRestartAvailable) {
      update.status = 'Restart taken'
    // if no check generated against restart or else restart check not received and restart check not marked as complete
    } else if (r.restartCheckId === null || (r.restartCheckReceived === false && r.restartCheckComplete === false)) {
      update.status = 'Remove restart'
    } else {
      update.status = 'Restart taken'
    }
    return R.mergeLeft(update, r)
  })
  return pupilIdentificationFlagService.sortAndAddIdentificationFlags(restartsWithStatus)
}
