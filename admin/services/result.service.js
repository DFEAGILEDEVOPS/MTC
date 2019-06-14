const resultDataService = require('../services/data-access/result.data.service')

const resultService = {}

/**
 * Find pupil data excluding results relevant data
 * @param {Number} schoolId
 * @param {Number} checkWindowId
 * @returns {Object} requestData
 */
resultService.getPupilRegisterData = async (schoolId, checkWindowId) => {
  if (!schoolId) {
    throw new Error('school id not found')
  }
  if (!checkWindowId) {
    throw new Error('check window id not found')
  }
  return resultDataService.getPupilRegisterData(schoolId, checkWindowId)
}

/**
 * Find pupils with results based on school id and merge with pupil register data
 * @param {Number} schoolId
 * @param {Number} checkWindowId
 * @param {Array} pupilRegisterData
 * @returns {Object} requestData
 */
resultService.getPupilResultData = async (schoolId, checkWindowId, pupilRegisterData) => {
  if (!schoolId) {
    throw new Error('school id not found')
  }
  if (!checkWindowId) {
    throw new Error('check window id not found')
  }
  if (!pupilRegisterData || !Array.isArray(pupilRegisterData)) {
    throw new Error('pupil data not found')
  }
  const pupilResultData = await resultDataService.sqlFindResultsBySchool(schoolId, checkWindowId)
  return pupilResultData.map(p => Object.assign(p, pupilRegisterData.find(pr => pr.id === p.id)))
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
