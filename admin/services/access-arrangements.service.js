const R = require('ramda')
const accessArrangementsDataService = require('../services/data-access/access-arrangements.data.service')
const pupilAccessArrangementsDataService = require('../services/data-access/pupil-access-arrangements.data.service')
const questionReaderReasonsDataService = require('../services/data-access/question-reader-reasons.data.service')
const pupilDataService = require('../services/data-access/pupil.data.service')
const accessArrangementsValidator = require('../lib/validator/access-arrangements-validator.js')
const monitor = require('../helpers/monitor')

const accessArrangementsService = {}

/**
 * Get access arrangements
 * @returns {Promise<Array>}
 */
accessArrangementsService.getAccessArrangements = async () => {
  return accessArrangementsDataService.sqlFindAccessArrangements()
}

/**
 * Submit access arrangements for single pupil
 * @param {Object} requestData
 * @param {Number} dfeNumber
 * @param {Number} userId
 * @returns {Object}
 */
accessArrangementsService.submit = async (requestData, dfeNumber, userId) => {
  const validationError = accessArrangementsValidator.validate(requestData)
  if (validationError.hasError()) {
    throw validationError
  }
  const pupil = await pupilDataService.sqlFindOneBySlugAndSchool(requestData.pupilUrlSlug, dfeNumber)
  const processedData = await accessArrangementsService.process(requestData, pupil, dfeNumber, userId)
  return accessArrangementsService.save(processedData, pupil)
}

/**
 * Process access arrangements data
 * @param {Object} requestData
 * @param {Object} pupil
 * @param {Number} dfeNumber
 * @param {Number} userId
 * @returns {Object}
 */
accessArrangementsService.process = async (requestData, pupil, dfeNumber, userId) => {
  const { accessArrangements: accessArrangementsCodes, questionReaderReason: questionReaderReasonCode } = requestData
  const pupilAccessArrangements = R.clone(requestData)
  const accessArrangementsIds = await accessArrangementsDataService.sqlFindAccessArrangementsIdsByCodes(accessArrangementsCodes)
  let questionReaderReasonId
  if (accessArrangementsIds.length === 0) {
    throw new Error('No access arrangements found')
  }
  pupilAccessArrangements['accessArrangements_ids'] = JSON.stringify(accessArrangementsIds)
  if (!pupil) {
    throw new Error('Pupil object is not found')
  }
  const omittedFields = []
  pupilAccessArrangements['pupil_id'] = pupil.id
  pupilAccessArrangements['recordedBy_user_id'] = userId
  if (!pupilAccessArrangements.accessArrangements.includes('ITA')) {
    omittedFields.push('inputAssistanceInformation')
  }
  if (pupilAccessArrangements.questionReaderReason !== 'OTH') {
    omittedFields.push('questionReaderOtherInformation')
  }
  if (pupilAccessArrangements.accessArrangements.includes('QNR')) {
    questionReaderReasonId = await questionReaderReasonsDataService.sqlFindQuestionReaderReasonIdByCode(questionReaderReasonCode)
  }
  if (questionReaderReasonId) {
    pupilAccessArrangements['questionReaderReasons_id'] = questionReaderReasonId
  }
  omittedFields.push('_csrf', 'accessArrangements', 'questionReaderReason', 'pupilUrlSlug')
  omittedFields.forEach(field => {
    delete pupilAccessArrangements[field]
  })
  return pupilAccessArrangements
}

/**
 * Save access arrangements data
 * @param {Object} pupilAccessArrangements
 * @param {Object} pupil
 * @returns {Object}
 */

accessArrangementsService.save = async (pupilAccessArrangements, pupil) => {
  const { id, foreName, lastName } = pupil
  const pupilAccessArrangement = await pupilAccessArrangementsDataService.sqlFindPupilAccessArrangementsByPupilId(pupil.id)
  if (pupilAccessArrangement && pupilAccessArrangement['pupil_id']) {
    // update
    await pupilAccessArrangementsDataService.sqlUpdate(pupilAccessArrangements)
  } else {
    // create
    await pupilAccessArrangementsDataService.sqlCreate(pupilAccessArrangements)
  }
  return { id, foreName, lastName }
}

module.exports = monitor('access-arrangements.service', accessArrangementsService)
