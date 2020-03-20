const R = require('ramda')
const accessArrangementsDataService = require('../services/data-access/access-arrangements.data.service')
const pupilAccessArrangementsDataService = require('../services/data-access/pupil-access-arrangements.data.service')
const questionReaderReasonsDataService = require('../services/data-access/question-reader-reasons.data.service')
const preparedCheckSyncService = require('../services/prepared-check-sync.service')
const pupilDataService = require('../services/data-access/pupil.data.service')
const accessArrangementsValidator = require('../lib/validator/access-arrangements-validator.js')

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
 * @param {Number} schoolId
 * @param {Number} userId
 * @returns {Object}
 */
accessArrangementsService.submit = async (submittedData, schoolId, userId) => {
  const urlSlug = submittedData.pupilUrlSlug || submittedData.urlSlug
  const validationError = accessArrangementsValidator.validate(submittedData)
  if (validationError.hasError()) {
    throw validationError
  }
  const pupil = await pupilDataService.sqlFindOneBySlugAndSchool(urlSlug, schoolId)
  const existingAccessArrangements = await pupilAccessArrangementsDataService.sqlFindPupilAccessArrangementsByPupilId(pupil.id)
  const hasExistingAccessArrangements = !!existingAccessArrangements && existingAccessArrangements.length > 0
  const processedData = await accessArrangementsService.prepareData(submittedData, pupil, schoolId, userId, hasExistingAccessArrangements)
  const displayData = await accessArrangementsService.save(processedData, pupil, hasExistingAccessArrangements)
  await preparedCheckSyncService.addMessages(urlSlug)
  return displayData
}

/**
 * Prepares access arrangements data for submission to the database
 * @param {Object} requestData
 * @param {Object} pupil
 * @param {Number} schoolId
 * @param {Number} userId
 * @param {Boolean} hasExistingAccessArrangements
 * @returns {Object}
 */
accessArrangementsService.prepareData = async (requestData, pupil, schoolId, userId, hasExistingAccessArrangements) => {
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
  pupilAccessArrangements.pupil_id = pupil.id
  if (hasExistingAccessArrangements) {
    pupilAccessArrangements.modifiedBy_userId = userId
  } else {
    pupilAccessArrangements.createdBy_userId = userId
  }
  pupilAccessArrangements.questionReaderReasonCode = questionReaderReason
  if (!pupilAccessArrangements.accessArrangements.includes(accessArrangementsDataService.CODES.INPUT_ASSISTANCE)) {
    omittedFields.push('inputAssistanceInformation')
  }
  if (!pupilAccessArrangements.accessArrangements.includes(accessArrangementsDataService.CODES.NEXT_BETWEEN_QUESTIONS)) {
    omittedFields.push('nextButtonInformation')
  }
  if (pupilAccessArrangements.questionReaderReason !== questionReaderReasonsDataService.CODES.OTHER) {
    omittedFields.push('questionReaderOtherInformation')
  }
  if (pupilAccessArrangements.accessArrangements.includes(accessArrangementsDataService.CODES.QUESTION_READER)) {
    questionReaderReasonId = await questionReaderReasonsDataService.sqlFindQuestionReaderReasonIdByCode(pupilAccessArrangements.questionReaderReasonCode)
  }
  if (pupilAccessArrangements.accessArrangements.includes(accessArrangementsDataService.CODES.COLOUR_CONTRAST)) {
    const pupilColourContrastAA = pupilAccessArrangements.accessArrangementsIdsWithCodes.find(paa => paa.code === 'CCT')
    pupilColourContrastAA.pupilColourContrasts_id = await pupilAccessArrangementsDataService.sqlFindPupilColourContrastsId(pupil.id, pupilColourContrastAA.id)
  }
  if (pupilAccessArrangements.accessArrangements.includes(accessArrangementsDataService.CODES.FONT_SIZE)) {
    const pupilFontSizeAA = pupilAccessArrangements.accessArrangementsIdsWithCodes.find(paa => paa.code === 'FTS')
    pupilFontSizeAA.pupilFontSizes_id = await pupilAccessArrangementsDataService.sqlFindPupilFontSizesId(pupil.id, pupilFontSizeAA.id)
  }
  if (questionReaderReasonId) {
    pupilAccessArrangements.questionReaderReasons_id = questionReaderReasonId
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
 * @param {Boolean} hasExistingAccessArrangements
 * @returns {Object}
 */

accessArrangementsService.save = async (pupilAccessArrangements, pupil, hasExistingAccessArrangements) => {
  const { urlSlug, foreName, lastName } = pupil
  if (hasExistingAccessArrangements) {
    const isUpdate = true
    await pupilAccessArrangementsDataService.sqlInsertAccessArrangements(pupilAccessArrangements, isUpdate)
  } else {
    await pupilAccessArrangementsDataService.sqlInsertAccessArrangements(pupilAccessArrangements)
  }
  return { urlSlug, foreName, lastName }
}

module.exports = accessArrangementsService
