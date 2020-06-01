const moment = require('moment')

const featureToggles = require('feature-toggles')
const redisCacheService = require('./data-access/redis-cache.service')
const redisKeyService = require('./redis-key.service')
const resultDataService = require('../services/data-access/result.data.service')
const sortService = require('../helpers/table-sorting')
const pupilIdentificationFlagService = require('./pupil-identification-flag.service')

const resultService = {
  sort: function sort (data) {
    return sortService.sortByProps(['lastName', 'firstName', 'middleNames'], data)
  },

  /**
   * Construct the result status for the pupil
   * @param {restartAvailable: boolean, currentCheckId: number, checkComplete: boolean, attendanceReason: string} pupil
   * @return {string}
   */
  assignStatus: function assignStatus (pupil) {
    if (pupil.restartAvailable) {
      return 'Did not attempt the restart'
    }

    if (pupil.currentCheckId) {
      if (pupil.checkComplete === true) {
        return ''
      } else {
        return 'Incomplete'
      }
    } else {
      if (pupil.attendanceReason) {
        return pupil.attendanceReason
      } else {
        return 'Did not participate'
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
  }
}

/**
 * Find pupils with results based on school id and merge with pupil register data
 * @param {Number} schoolId
 * @returns {Object} requestData
 */
resultService.getPupilResultData = async function (schoolId) {
  if (!schoolId) {
    throw new Error('school id not found')
  }
  const redisKey = redisKeyService.getSchoolResultsKey(schoolId)
  let result = await redisCacheService.get(redisKey)
  if (!result && featureToggles.isFeatureEnabled('schoolResultFetchFromDbEnabled') === true) {
    result = await this.getPupilResultDataFromDb(schoolId)
    // TODO: jms save result to redis
  }
  // let parseResult
  // try {
  //   parseResult = JSON.parse(result)
  // } catch (ignore) {}
  return result
}

/**
 * Find school score based on check window id
 * @param {Number} schoolId
 * @param {Number} checkWindowId
 * @returns {Object} requestData
 */
resultService.getSchoolScore = async (schoolId, checkWindowId) => {
  if (!schoolId) {
    throw new Error('school id not found')
  }
  if (!checkWindowId) {
    throw new Error('check window id not found')
  }
  const schoolScore = await resultDataService.sqlFindSchoolScoreBySchoolIdAndCheckWindowId(schoolId, checkWindowId)
  if (!schoolScore || Object.keys(schoolScore).length === 0) {
    return
  }
  return schoolScore
}

/**
 * Assign result status to each pupil when appropriate based on check and pupil status
 * @param {Array} pupils
 * @returns {Array} pupilsData
 */
resultService.assignResultStatuses = (pupils) => {
  return pupils.map((p) => {
    let statusInformation = ''
    if (p.pupilStatusCode !== 'COMPLETED' && p.pupilStatusCode !== 'NOT_TAKING') {
      statusInformation = 'Did not participate'
    }
    if (p.pupilRestartId && !p.pupilRestartCheckId) {
      statusInformation = 'Did not attempt the restart'
    }
    if (p.checkStatusCode === 'NTR' && p.pupilStatusCode === 'STARTED') {
      statusInformation = 'Incomplete'
    }
    p.statusInformation = statusInformation
    return p
  })
}

module.exports = resultService
