const R = require('ramda')
const accessArrangementsDataService = require('../services/data-access/access-arrangements.data.service')
const pupilAccessArrangementsDataService = require('../services/data-access/pupil-access-arrangements.data.service')
const questionReaderReasonsDataService = require('../services/data-access/question-reader-reasons.data.service')
const preparedCheckSyncService = require('../services/prepared-check-sync.service')
const pupilDataService = require('../services/data-access/pupil.data.service')
const accessArrangementsValidator = require('../lib/validator/access-arrangements-validator.js')
const config = require('../config')
const moment = require('moment-timezone')
const checkWindowService = require('./check-window-v2.service')
const aaViewModes = require('../lib/consts/access-arrangements-view-mode')
const { PupilFrozenService } = require('./pupil-frozen/pupil-frozen.service')

const accessArrangementsService = {
/**
 * Get access arrangements
 * @returns {Promise<Array>}
 */
  getAccessArrangements: async function getAccessArrangements () {
    return accessArrangementsDataService.sqlFindAccessArrangements()
  },
  /**
 * Submit access arrangements for single pupil
 * @param {Object} submittedData
 * @param {Number} schoolId
 * @param {Number} userId
 * @returns {Promise<Object>}
 */
  submit: async function submit (submittedData, schoolId, userId) {
    const urlSlug = submittedData.pupilUrlSlug || submittedData.urlSlug
    await PupilFrozenService.throwIfFrozenByUrlSlugs([urlSlug])
    const validationError = accessArrangementsValidator.validate(submittedData)
    if (validationError.hasError()) {
      throw validationError
    }
    const pupil = await pupilDataService.sqlFindOneBySlugAndSchool(urlSlug, schoolId)
    const processedData = await accessArrangementsService.prepareData(submittedData, pupil, schoolId, userId)
    const displayData = await accessArrangementsService.save(processedData, pupil)
    await preparedCheckSyncService.addMessages(urlSlug)
    return displayData
  },
  /**
 * Prepares access arrangements data for submission to the database
 * @param {Object} requestData
 * @param {Object} pupil
 * @param {Number} schoolId
 * @param {Number} userId
 * @returns {Promise<Object>}
 */
  prepareData: async function prepareData (requestData, pupil, schoolId, userId) {
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
    pupilAccessArrangements.recordedBy_user_id = userId
    pupilAccessArrangements.questionReaderReasonCode = questionReaderReason
    if (!pupilAccessArrangements.accessArrangements.includes(accessArrangementsDataService.CODES.INPUT_ASSISTANCE)) {
      omittedFields.push('inputAssistanceInformation')
    }
    if (pupilAccessArrangements.questionReaderReason !== questionReaderReasonsDataService.CODES.OTHER) {
      omittedFields.push('questionReaderOtherInformation')
    }
    if (pupilAccessArrangements.accessArrangements.includes(accessArrangementsDataService.CODES.QUESTION_READER)) {
      questionReaderReasonId = await questionReaderReasonsDataService.sqlFindQuestionReaderReasonIdByCode(pupilAccessArrangements.questionReaderReasonCode)
    }
    if (pupilAccessArrangements.accessArrangements.includes(accessArrangementsDataService.CODES.COLOUR_CONTRAST)) {
      const pupilColourContrastAA = pupilAccessArrangements.accessArrangementsIdsWithCodes.find(paa => paa.code === 'CCT')
      pupilColourContrastAA.colourContrastLookup_Id = await pupilAccessArrangementsDataService.sqlFindPupilColourContrastsId(pupil.id, pupilColourContrastAA.id)
    }
    if (pupilAccessArrangements.accessArrangements.includes(accessArrangementsDataService.CODES.FONT_SIZE)) {
      const pupilFontSizeAA = pupilAccessArrangements.accessArrangementsIdsWithCodes.find(paa => paa.code === 'FTS')
      pupilFontSizeAA.fontSizeLookup_Id = await pupilAccessArrangementsDataService.sqlFindPupilFontSizesId(pupil.id, pupilFontSizeAA.id)
    }
    if (questionReaderReasonId) {
      pupilAccessArrangements.questionReaderReasons_id = questionReaderReasonId
    }
    omittedFields.push('accessArrangements', 'questionReaderReason', 'pupilUrlSlug')
    omittedFields.forEach(field => {
      delete pupilAccessArrangements[field]
    })
    return pupilAccessArrangements
  },
  /**
 * Save access arrangements data
 * @param {Object} pupilAccessArrangements
 * @param {Object} pupil
 * @returns {Promise<Object>}
 */
  save: async function save (pupilAccessArrangements, pupil) {
    const { urlSlug, foreName, lastName } = pupil
    const pupilAccessArrangement = await pupilAccessArrangementsDataService.sqlFindPupilAccessArrangementsByPupilId(pupil.id)
    if (pupilAccessArrangement && pupilAccessArrangement.length) {
      const isUpdate = true
      await pupilAccessArrangementsDataService.sqlInsertAccessArrangements(pupilAccessArrangements, isUpdate)
    } else {
      await pupilAccessArrangementsDataService.sqlInsertAccessArrangements(pupilAccessArrangements)
    }
    return { urlSlug, foreName, lastName }
  },
  /**
   * @description determines whether AA module is editable, readonly or unavailable
   * @param {string} timezone
   * @returns {Promise<string>}
   */
  getCurrentViewMode: async function getCurrentViewMode (timezone) {
    const currentDate = moment.tz(timezone || config.DEFAULT_TIMEZONE)
    const currentCheckWindow = await checkWindowService.getActiveCheckWindow()
    const checkActive = currentDate.isBetween(currentCheckWindow.checkStartDate, currentCheckWindow.checkEndDate)
    const adminActive = currentDate.isBetween(currentCheckWindow.adminStartDate, currentCheckWindow.adminEndDate)
    const tryItOutActive = currentDate.isBetween(currentCheckWindow.familiarisationCheckStartDate, currentCheckWindow.familiarisationCheckEndDate)
    if (adminActive && (checkActive || tryItOutActive)) return aaViewModes.edit
    if (adminActive && !checkActive && !tryItOutActive) return aaViewModes.readonly
    return aaViewModes.unavailable
  }
}

module.exports = accessArrangementsService
