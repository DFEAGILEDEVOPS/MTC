'use strict'

const logger = require('./log.service').getLogger()
const moment = require('moment')

const featureToggles = require('feature-toggles')
const redisCacheService = require('./data-access/redis-cache.service')
const redisKeyService = require('./redis-key.service')
const resultDataService = require('../services/data-access/result.data.service')
const sortService = require('../helpers/table-sorting')
const pupilIdentificationFlagService = require('./pupil-identification-flag.service')
const schoolResultsTtl = 60 * 60 * 24 * 180 // cache school results for 180 days
const resultsStrings = require('../lib/consts/mtc-results')

/**
 * @typedef {object} PupilRestart
 * @property {boolean} restartAvailable
 * @property {number} currentCheckId
 * @property {boolean} checkComplete
 * @property {string} attendanceReason
 */

const resultService = {
  sort: function sort (data) {
    return sortService.sortByProps(['lastName', 'foreName', 'dateOfBirth', 'middleNames'], data)
  },

  /**
   * Construct the result status for the pupil
   * @param {PupilRestart} pupil
   * @return {string}
   */
  assignStatus: function assignStatus (pupil) {
    if (pupil.restartAvailable) {
      return resultsStrings.restartNotTaken
    }

    if (pupil.currentCheckId) {
      if (pupil.checkComplete === true) {
        return resultsStrings.complete
      } else {
        return resultsStrings.incomplete
      }
    } else {
      if (pupil.attendanceReason) {
        return pupil.attendanceReason
      } else {
        return resultsStrings.didNotParticipate
      }
    }
  },

  /**
   * Return pupil data showing mark, and status
   * @param pupils
   * @return {*}
   */
  createPupilData: function createViewData (pupils) {
    return pupils.map(o => {
      return {
        foreName: o.foreName,
        middleNames: o.middleNames,
        lastName: o.lastName,
        group_id: o.group_id,
        dateOfBirth: o.dateOfBirth,
        score: o.mark,
        status: this.assignStatus(o),
        urlSlug: o.urlSlug,
        // attendanceCode is used to determine the pupil result in the CTF XML file
        attendanceCode: o.attendanceCode
      }
    })
  },

  /**
   *
   * @param schoolId
   * @return {Promise<{pupils: {foreName:string, middleNames:string, lastName:string, group_id:null|number, dateOfBirth: Moment.moment, mark:null|number, status:string}[], schoolId: number, generatedAt: (*|moment.Moment)}>}
   */
  getPupilResultDataFromDb: async function getPupilResultDataFromDb (schoolId) {
    const data = await resultDataService.sqlFindPupilResultsForSchool(schoolId)
    return {
      generatedAt: moment(),
      schoolId: schoolId,
      pupils: pupilIdentificationFlagService.addIdentificationFlags(this.sort(this.createPupilData(data)))
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
      } catch (ignored) {}
    }
    return result
  }
}

module.exports = resultService
