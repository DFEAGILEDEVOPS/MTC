const R = require('ramda')
const accessArrangementsDataService = require('../services/data-access/access-arrangements.data.service')
const pupilAccessArrangementsDataService = require('../services/data-access/pupil-access-arrangements.data.service')
const questionReaderReasonsDataService = require('../services/data-access/question-reader-reasons.data.service')
const pupilDataService = require('../services/data-access/pupil.data.service')
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
 * Process access arrangements for single pupil
 * @param {Object} requestData
 * @param {Number} dfeNumber
 * @param {Number} userId
 * @returns {Object}
 */
accessArrangementsService.submit = async (requestData, dfeNumber, userId) => {
  // validation here
  // const validationError = accessArrangementsValidator.validate(requestData)
  // if (validationError.hasError()) {
  //   throw validationError
  // }
  const { pupilUrlSlug, accessArrangements: accessArrangementsCodes, questionReaderReason: questionReaderReasonCode } = requestData
  if (!pupilUrlSlug) {
    throw new Error('No pupil selected')
  }
  if (!accessArrangementsCodes) {
    throw new Error('No access arrangements selected')
  }
  let pupilAccessArrangements = R.clone(requestData)
  const accessArrangements = await accessArrangementsDataService.sqlFindAccessArrangementsByCodes(accessArrangementsCodes)
  let questionReaderReason
  if (accessArrangements.length === 0) {
    throw new Error('No access arrangements found')
  }
  pupilAccessArrangements['accessArrangements_ids'] = JSON.stringify(accessArrangements.map(aa => aa.id))
  const pupil = await pupilDataService.sqlFindOneBySlugAndSchool(pupilUrlSlug, dfeNumber)
  if (!pupil) {
    throw new Error('Pupil url slug does not match a pupil record')
  }
  pupilAccessArrangements['pupil_id'] = pupil.id
  pupilAccessArrangements['recordedBy_user_id'] = userId
  if (!pupilAccessArrangements.accessArrangements.includes('ITA')) {
    pupilAccessArrangements = R.omit(['inputAssistanceInformation'], pupilAccessArrangements)
  }
  if (pupilAccessArrangements.questionReaderReason !== 'OTH') {
    pupilAccessArrangements = R.omit(['questionReaderOtherInformation'], pupilAccessArrangements)
  }
  if (pupilAccessArrangements.accessArrangements.includes('QNR')) {
    questionReaderReason = await questionReaderReasonsDataService.sqlFindQuestionReaderReasonByCode(questionReaderReasonCode)
  }
  if (questionReaderReason && questionReaderReason.id) {
    pupilAccessArrangements['questionReaderReasons_id'] = questionReaderReason.id
  }
  pupilAccessArrangements = R.omit(['_csrf', 'accessArrangements', 'questionReaderReason', 'pupilUrlSlug'], pupilAccessArrangements)
  return accessArrangementsService.save(pupilAccessArrangements, pupil)
}

/**
 * Save access arrangements for single pupil
 * @param {Object} pupilAccessArrangements
 * @param {Object} pupil
 * @returns {Object}
 */

accessArrangementsService.save = async (pupilAccessArrangements, pupil) => {
  const pupilAccessArrangement = await pupilAccessArrangementsDataService.sqlFindPupilAccessArrangementsByPupilId(pupil.id)
  if (pupilAccessArrangement && pupilAccessArrangement['pupil_id']) {
    // update
    await pupilAccessArrangementsDataService.sqlUpdate(pupilAccessArrangements)
  } else {
    // create
    await pupilAccessArrangementsDataService.sqlCreate(pupilAccessArrangements)
  }
  return pupil
}

module.exports = monitor('access-arrangements.service', accessArrangementsService)
