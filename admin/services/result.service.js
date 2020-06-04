const resultDataService = require('../services/data-access/result.data.service')
const redisCacheService = require('./data-access/redis-cache.service')

const resultService = {}

/**
 * Find pupils with results based on school id and merge with pupil register data
 * @param {Number} schoolId
 * @returns {Promise<Object>} requestData
 */
resultService.getPupilResultData = async (schoolId) => {
  if (!schoolId) {
    throw new Error('school id not found')
  }
  const redisKey = `result:${schoolId}`
  const result = await redisCacheService.get(redisKey)
  let parseResult
  try {
    parseResult = JSON.parse(result)
  } catch (ignore) {}
  return parseResult
}

/**
 * Find school score based on check window id
 * @param {Number} schoolId
 * @param {Number} checkWindowId
 * @returns {Promise<Object>} requestData
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
