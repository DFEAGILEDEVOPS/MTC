'use strict'

const moment = require('moment')

const featureToggles = require('feature-toggles')
const redisCacheService = require('./data-access/redis-cache.service')
const redisKeyService = require('./redis-key.service')
const resultDataService = require('../services/data-access/result.data.service')
const sortService = require('../helpers/table-sorting')
const pupilIdentificationFlagService = require('./pupil-identification-flag.service')

const resultService = {
  status: Object.freeze({
    restartNotTaken: 'Did not attempt the restart',
    incomplete: 'Incomplete',
    didNotParticipate: 'Did not participate',
    complete: ''
  }),

  sort: function sort (data) {
    return sortService.sortByProps(['lastName', 'foreName', 'dateOfBirth', 'middleNames'], data)
  },

  /**
   * Construct the result status for the pupil
   * @param {restartAvailable: boolean, currentCheckId: number, checkComplete: boolean, attendanceReason: string} pupil
   * @return {string}
   */
  assignStatus: function assignStatus (pupil) {
    if (pupil.restartAvailable) {
      return resultService.status.restartNotTaken
    }

    if (pupil.currentCheckId) {
      if (pupil.checkComplete === true) {
        return resultService.status.complete
      } else {
        return resultService.status.incomplete
      }
    } else {
      if (pupil.attendanceReason) {
        return pupil.attendanceReason
      } else {
        return resultService.status.didNotParticipate
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
        status: this.assignStatus(o)
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
   * @returns {Object} requestData
   */
  getPupilResultData: async function getPupilResultData (schoolId) {
    if (!schoolId) {
      throw new Error('school id not found')
    }
    const redisKey = redisKeyService.getSchoolResultsKey(schoolId)
    let result = await redisCacheService.get(redisKey)
    if (!result && featureToggles.isFeatureEnabled('schoolResultFetchFromDbEnabled') === true) {
      result = await this.getPupilResultDataFromDb(schoolId)
      // TODO: jms save result to redis
    }
    return result
  }
}

module.exports = resultService
