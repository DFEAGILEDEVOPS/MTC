'use strict'

const pupilIdentificationFlagService = require('../services/pupil-identification-flag.service')
const restartDataService = require('./data-access/restart-v2.data.service')
const config = require('../config')

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
 * Find restarts for a particular school
 * Returns: array of objects:
 * {
        id: record.id,
        pupilId: p.id,
        pupilUrlSlug: p.urlSlug,
        reason: reason,
        status: record.status,
        foreName: p.foreName,
        lastName: p.lastName,
        middleNames: p.middleNames,
        dateOfBirth: p.dateOfBirth
    }
 */
module.exports.getRestartsForSchool = async function getRestartsForSchool (schoolId) {
  const restarts = await restartDataService.getRestartsForSchool(schoolId)
  restarts.forEach(r => {
    if (r.totalCheckCount === undefined || r.totalCheckCount === null) {
      r.totalCheckCount = 0
    }
    if (r.totalCheckCount === config.RESTART_MAX_ATTEMPTS + 1) {
      r.status = 'Maximum number of restarts taken'
    } else if (r.code === 'NEW' || r.code === 'COL' || r.code === null) {
      r.status = 'Remove restart'
    } else {
      r.status = 'Restart taken'
    }
  })
  return pupilIdentificationFlagService.sortAndAddIdentificationFlags(restarts)
}
