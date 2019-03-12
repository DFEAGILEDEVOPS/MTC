const resultDataService = require('../services/data-access/result.data.service')

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
  return resultDataService.sqlFindResultsBySchool(schoolId, checkWindowId)
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

module.exports = resultService
