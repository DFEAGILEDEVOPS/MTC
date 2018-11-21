const R = require('ramda')
const accessArrangementsDataService = require('../services/data-access/access-arrangements.data.service')
const pupilAccessArrangementsDataService = require('../services/data-access/pupil-access-arrangements.data.service')
const questionReaderReasonsDataService = require('../services/data-access/question-reader-reasons.data.service')
const pinGenerationDataService = require('../services/data-access/pin-generation.data.service')
const pupilDataService = require('../services/data-access/pupil.data.service')
const accessArrangementsValidator = require('../lib/validator/access-arrangements-validator.js')
const azureQueueService = require('../services/azure-queue.service')

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
 * @param {Object} submittedData
 * @param {Number} dfeNumber
 * @param {Number} userId
 * @returns {Object}
 */
accessArrangementsService.submit = async (submittedData, dfeNumber, userId) => {
  const urlSlug = submittedData.pupilUrlSlug || submittedData.urlSlug
  const validationError = accessArrangementsValidator.validate(submittedData)
  if (validationError.hasError()) {
    throw validationError
  }
  const pupil = await pupilDataService.sqlFindOneBySlugAndSchool(urlSlug, dfeNumber)
  const processedData = await accessArrangementsService.process(submittedData, pupil, dfeNumber, userId)
  const displayData = await accessArrangementsService.save(processedData, pupil)
  const results = await pinGenerationDataService.sqlFindActivePinsByUrlSlug(urlSlug)
  // Sync existing preparedCheck(s) when 1 or more active pins exist
  if (results.length > 0) {
    const checkCodes = results.map(r => r.checkCode)
    checkCodes.forEach(checkCode => {
      azureQueueService.addMessage('prepared-check-sync', { version: 1, checkCode: checkCode })
    })
  }
  return displayData
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
  const { accessArrangements: accessArrangementsCodes, questionReaderReason } = requestData
  const pupilAccessArrangements = R.clone(requestData)
  pupilAccessArrangements.accessArrangementsIdsWithCodes = await accessArrangementsDataService.sqlFindAccessArrangementsIdsWithCodes(accessArrangementsCodes)
  let questionReaderReasonId
  if (pupilAccessArrangements.accessArrangements.length === 0) {
    throw new Error('No access arrangements found')
  }
  if (!pupil) {
    throw new Error('Pupil object is not found')
  }
  const omittedFields = []
  pupilAccessArrangements['pupil_id'] = pupil.id
  pupilAccessArrangements['recordedBy_user_id'] = userId
  pupilAccessArrangements['questionReaderReasonCode'] = questionReaderReason
  if (!pupilAccessArrangements.accessArrangements.includes(accessArrangementsDataService.CODES.INPUT_ASSISTANCE)) {
    omittedFields.push('inputAssistanceInformation')
  }
  if (pupilAccessArrangements.questionReaderReason !== questionReaderReasonsDataService.CODES.OTHER) {
    omittedFields.push('questionReaderOtherInformation')
  }
  if (pupilAccessArrangements.accessArrangements.includes(accessArrangementsDataService.CODES.QUESTION_READER)) {
    questionReaderReasonId = await questionReaderReasonsDataService.sqlFindQuestionReaderReasonIdByCode(pupilAccessArrangements.questionReaderReasonCode)
  }
  if (questionReaderReasonId) {
    pupilAccessArrangements['questionReaderReasons_id'] = questionReaderReasonId
  }
  omittedFields.push('accessArrangements', 'questionReaderReason', 'pupilUrlSlug')
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
  const { urlSlug, foreName, lastName } = pupil
  const pupilAccessArrangement = await pupilAccessArrangementsDataService.sqlFindPupilAccessArrangementsByPupilId(pupil.id)
  if (pupilAccessArrangement && pupilAccessArrangement.length) {
    const isUpdate = true
    await pupilAccessArrangementsDataService.sqlInsertAccessArrangements(pupilAccessArrangements, isUpdate)
  } else {
    await pupilAccessArrangementsDataService.sqlInsertAccessArrangements(pupilAccessArrangements)
  }
  return { urlSlug, foreName, lastName }
}

module.exports = accessArrangementsService
