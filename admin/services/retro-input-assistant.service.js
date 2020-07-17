'use strict'

const validator = require('../lib/validator/retro-input-assistant-validator')
const dataService = require('./data-access/retro-input-assistant.data.service')
const uuidValidator = require('../lib/validator/common/uuid-validator')

const service = {
  /**
   * @typedef {object} retroInputAssistantData
   * @property {string} firstName
   * @property {string} lastName
   * @property {string} reason
   * @property {string} pupilUuid
   * @property {number} userId
   */

  /**
    * @description persists retrospective input assistant data
    * @param {retroInputAssistantData} retroInputAssistantData
    */
  save: async function add (retroInputAssistantData) {
    const uuidValidationResult = uuidValidator.validate(retroInputAssistantData.pupilUuid, 'pupilUuid')
    if (uuidValidationResult.hasError()) {
      throw uuidValidationResult
    }
    const pupilData = await dataService.getPupilIdAndCurrentCheckIdByUrlSlug(retroInputAssistantData.pupilUuid)
    if (!pupilData || pupilData.length === 0) {
      throw new Error('pupil lookup failed')
    }
    const pupilInfo = {
      pupilId: pupilData[0].id,
      currentCheckId: pupilData[0].currentCheckId
    }
    const data = {
      firstName: retroInputAssistantData.firstName,
      lastName: retroInputAssistantData.lastName,
      reason: retroInputAssistantData.reason,
      pupilId: pupilInfo.pupilId,
      userId: retroInputAssistantData.userId,
      checkId: pupilInfo.currentCheckId
    }
    const validationResult = validator.validate(data)
    if (validationResult.hasError()) {
      throw validationResult
    }
    return dataService.create(data)
  },
  /**
 * Returns pupils with eligible for access arrangements
 * @param {Number} schoolId
 * @returns {Promise<Array>}
 */
  getEligiblePupilsWithFullNames: async function getEligiblePupilsWithFullNames (schoolId) {
    if (!schoolId) {
      throw new Error('schoolId is not provided')
    }
    const pupils = await dataService.sqlFindEligiblePupilsBySchoolId(schoolId)
    return pupils.map(p => ({
      fullName: `${p.lastName} ${p.foreName}${p.middleNames ? ' ' + p.middleNames : ''}`,
      urlSlug: p.urlSlug
    }))
  }
}

module.exports = service
