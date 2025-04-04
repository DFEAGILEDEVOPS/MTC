'use strict'

const logger = require('./log.service').getLogger()
const moment = require('moment')

const featureToggles = require('feature-toggles')
const redisCacheService = require('./data-access/redis-cache.service')
const redisKeyService = require('./redis-key.service')
const resultDataService = require('../services/data-access/result.data.service')
const pupilIdentificationFlagService = require('./pupil-identification-flag.service')
const schoolResultsTtl = 60 * 60 * 24 * 180 // cache school results for 180 days
const resultsStrings = require('../lib/consts/mtc-results')

/**
 * Warning: Partial properties
 * @typedef {object} PupilRestart
 * @property {boolean} restartAvailable
 * @property {number} currentCheckId
 * @property {boolean} complete
 * @property {boolean} checkComplete
 * @property {string} attendanceReason
 */

const resultService = {
  /**
   * Construct the result status for the pupil
   * @param {CreatePupilDataParam} pupil
   * @return {string}
   */
  assignStatus: function assignStatus (pupil) {
    if (pupil.attendanceReason) {
      return pupil.attendanceReason
    }

    if (pupil.restartAvailable) {
      return resultsStrings.restartNotTaken
    }

    if (pupil.currentCheckId) {
      if (pupil.checkComplete === true && pupil.mark !== null && pupil.mark !== undefined) {
        return resultsStrings.complete
      } else {
        return resultsStrings.incomplete
      }
    } else {
      // 64154: change 'Did not participate' to 'Incomplete'
      return resultsStrings.incomplete
    }
  },

  /**
   * @typedef {object} CreatePupilDataParam
   * @property {?string} attendanceCode
   * @property {number} attendanceId
   * @property {?string} attendanceReason
   * @property {boolean} checkComplete
   * @property {number} currentCheckId
   * @property {moment.Moment} dateOfBirth
   * @property {string} foreName
   * @property {string} gender
   * @property {?number} group_id
   * @property {string} lastName
   * @property {?number} mark
   * @property {string} middleNames
   * @property {number} pupilId
   * @property {boolean} restartAvailable
   * @property {number} school_id
   * @property {string} upn
   * @property {string} urlSlug
   * @property {boolean} complete - check.complete flag
   */

  /**
   * @typedef {object} CreatePupilDataRetval
   * @property {?string} attendanceCode
   * @property {moment.Moment} dateOfBirth
   * @property {moment.Moment} originalDateOfBirth
   * @property {string} foreName
   * @property {string} gender
   * @property {?number} group_id
   * @property {string} lastName
   * @property {string} middleNames
   * @property {?number} score
   * @property {string} status
   * @property {string} urlSlug
   * @property {string} upn
   * @property {boolean} complete - check.complete flag
   */
  /**
   * Return pupil data showing mark, and status
   * @param {CreatePupilDataParam[]} pupils - array of pupil(ish) objects from the db mtc_admin.pupil
   * @return {CreatePupilDataRetval[]} - subset of the above, now with `score` and `status` props
   */
  createPupilData: function createPupilData (pupils) {
    return pupils.map(o => {
      return {
        foreName: o.foreName,
        middleNames: o.middleNames,
        lastName: o.lastName,
        group_id: o.group_id,
        dateOfBirth: o.dateOfBirth,
        // Workaround for a bug that was in addIdentificationFlags() call, but is now fixed,  which makes dateOfBirth
        // either a date or a string type.  Ignore dateOfBirth and use this property to get a known data type.
        originalDateOfBirth: o.dateOfBirth,
        score: o.mark,
        status: this.assignStatus(o),
        urlSlug: o.urlSlug,
        // attendanceCode is used to determine the pupil result in the CTF XML file
        attendanceCode: o.attendanceCode,
        upn: o.upn,
        gender: o.gender,
        complete: o.complete
      }
    })
  },

  /**
   *
   * @param schoolId
   * @return {Promise<{pupils: {foreName:string, middleNames:string, lastName:string, group_id:null|number, dateOfBirth: moment.Moment, mark:null|number, status:string, complete: Boolean}[], schoolId: number, generatedAt: (*|moment.Moment)}>}
   */
  getPupilResultDataFromDb: async function getPupilResultDataFromDb (schoolId) {
    const data = await resultDataService.sqlFindPupilResultsForSchool(schoolId)
    return {
      generatedAt: moment(),
      schoolId,
      pupils: pupilIdentificationFlagService.sortAndAddIdentificationFlags(this.createPupilData(data))
    }
  },

  /**
   * Find pupils with results based on school id and merge with pupil register data
   * @param {Number} schoolId
   * @returns {Promise<object>} requestData
   */
  getPupilResultData: async function getPupilResultData (schoolId) {
    if (!schoolId) {
      throw new Error('school id not found')
    }
    const redisKey = redisKeyService.getSchoolResultsKey(schoolId)
    let result = await redisCacheService.get(redisKey)
    if (!result && featureToggles.isFeatureEnabled('schoolResultFetchFromDbEnabled') === true) {
      logger.debug(`result.service: redis cache miss for school ${schoolId}`)
      result = await this.getPupilResultDataFromDb(schoolId)
      try {
        await redisCacheService.set(redisKey, result, schoolResultsTtl)
      } catch {
        // do nothing
      }
    }
    return result
  }
}

module.exports = resultService
