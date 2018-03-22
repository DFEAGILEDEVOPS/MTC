/** @namespace */

const pupilIdentificationFlag = require('../services/pupil-identification-flag.service')
const pupilDataService = require('./data-access/pupil.data.service')
const pupilsNotTakingCheckDataService = require('../services/data-access/pupils-not-taking-check.data.service')

const pupilsNotTakingCheckService = {}

  /**
   * Sort columns by reason asc/desc.
   * @param pupilsList
   * @param sortDirection
   * @returns {*}
   */
pupilsNotTakingCheckService.sortPupilsByReason = (pupilsList, sortDirection) => {
  let sortedPupilsList
  sortedPupilsList = pupilsList.sort((a, b) => {
    if (a.reason === 'N/A') {
      return 1
    } else if (b.reason === 'N/A') {
      return -1
    } else if (a.reason === b.reason) {
      return 0
    } else if (sortDirection === 'asc') {
      return a.reason < b.reason ? -1 : 1
    } else {
      return a.reason < b.reason ? 1 : -1
    }
  })
  return sortedPupilsList
}

/**
 * Get pupils with and without reasons assigned.
 * @param schoolId
 * @param sortField
 * @param sortDirection
 * @returns {Promise<*>}
 */
pupilsNotTakingCheckService.pupils = async (schoolId, sortField, sortDirection) => {
  const pupils = await pupilDataService.sqlFindSortedPupilsWithAttendanceReasons(schoolId, sortField, sortDirection)
  return pupilIdentificationFlag.addIdentificationFlags(pupils)
}

/**
 * Get pupils only with reasons.
 * @param schoolId
 * @returns {Promise<*>}
 */
pupilsNotTakingCheckService.pupilsWithReasons = async (schoolId) => {
  const pupils = await pupilsNotTakingCheckDataService.sqlFindPupilsWithReasons(schoolId)
  return pupilIdentificationFlag.addIdentificationFlags(pupils)
}

/**
 * Build the pupil slug based on the body object.a
 * @param reqBody
 * @returns {string}
 */
pupilsNotTakingCheckService.getPupilSlugs = (reqBody) => {
  let postedPupilSlugs = ''
  if (typeof reqBody === 'object') {
    if (Array.isArray(reqBody)) {
      postedPupilSlugs = reqBody
    } else {
      postedPupilSlugs = Object.values(reqBody)
    }
  } else if (typeof reqBody === 'string') {
    postedPupilSlugs = [ reqBody ]
  }
  return postedPupilSlugs
}

module.exports = pupilsNotTakingCheckService
