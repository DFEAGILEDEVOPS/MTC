/** @namespace */

const pupilIdentificationFlag = require('../services/pupil-identification-flag.service')
const pupilDataService = require('./data-access/pupil.data.service')
const pupilsNotTakingCheckDataService = require('../services/data-access/pupils-not-taking-check.data.service')

const pupilsNotTakingCheckService = {
  /**
   * Sort columns by reason asc/desc.
   * @param pupilsList
   * @param sortDirection
   * @returns {*}
   */
  sortPupilsByReason: (pupilsList, sortDirection) => {
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
  },

  /**
   * Get pupils with and without reasons assigned.
   * @param schoolId
   * @returns {Promise<*>}
   */
  getPupilsWithReasonsForDfeNumber: async (schoolId) => {
    const pupils = await pupilDataService.sqlFindSortedPupilsWithAttendanceReasons(schoolId)
    return pupilIdentificationFlag.addIdentificationFlags(pupils)
  },

  /**
   * Get pupils only with reasons.
   * @param schoolId
   * @returns {Promise<*>}
   */
  getPupilsWithReasons: async (schoolId) => {
    const pupils = await pupilsNotTakingCheckDataService.sqlFindPupilsWithReasons(schoolId)
    return pupilIdentificationFlag.addIdentificationFlags(pupils)
  },

  /**
   * Build the pupil slug based on the body object.
   * The req.body.pupil data is posted in 3 forms:
   * 1: string: 'abc-def' (single selection)
   * 2: array of strings: ['abc-def', 'foo-bar'] (multiple selection)
   * 3: object with properties/values: { 0: 'abc-def, 1: 'foo-bar' } (using checkbox "Select all")
   * @param reqBody
   * @returns {string}
   */
  getPupilSlugs: (reqBody) => {
    let postedPupilSlugs = ''
    if (typeof reqBody === 'object') {
      if (Array.isArray(reqBody)) {
        postedPupilSlugs = reqBody
      } else {
        postedPupilSlugs = Object.values(reqBody)
      }
    } else if (typeof reqBody === 'string') {
      postedPupilSlugs = [reqBody]
    }
    return postedPupilSlugs
  }
}

module.exports = pupilsNotTakingCheckService
