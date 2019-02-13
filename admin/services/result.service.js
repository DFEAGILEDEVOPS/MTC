const resultDataService = require('../services/data-access/result.data.service')
const schoolScoreDataService = require('../services/data-access/school-score.data.service')

const resultService = {}

/**
 * Find pupils with results based on school id
 * @param {Number} schoolId
 * @param {Number} checkWindowId
 * @returns {Object} requestData
 */
resultService.getPupilsWithResults = async (schoolId, checkWindowId) => {
  if (!schoolId) {
    throw new Error('school id not found')
  }
  if (!checkWindowId) {
    throw new Error('check window id not found')
  }
  return resultDataService.sqlFindPupilsWithScoresAndAttendanceBySchoolIdAndCheckWindowId(schoolId, checkWindowId)
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
  const schoolScore = await schoolScoreDataService.sqlFindSchoolScoreBySchoolIdAndCheckWindowId(schoolId, checkWindowId)
  if (!schoolScore || !schoolScore.score) {
    throw new Error(`no school score record is found or no score is set for school id: ${schoolId} and check window id: ${checkWindowId}`)
  }
  return schoolScore.score
}

module.exports = resultService
