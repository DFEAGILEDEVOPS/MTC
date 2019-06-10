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
    const restartCheckStatusCodes = ['NTR', 'EXP', 'CMP']
    if (p.pupilStatusCode === 'UNALLOC' && restartCheckStatusCodes.includes(p.checkStatusCode)) {
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
