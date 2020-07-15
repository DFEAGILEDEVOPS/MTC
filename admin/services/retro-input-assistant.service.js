'use strict'

const validator = require('../lib/validator/retro-input-assistant-validator')
const dataService = require('./data-access/retro-input-assistant.data.service')

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
    const pupilData = await dataService.getPupilIdAndCurrentCheckIdByUrlSlug(retroInputAssistantData.pupilUuid)
    const data = {
      firstName: retroInputAssistantData.firstName,
      lastName: retroInputAssistantData.lastName,
      reason: retroInputAssistantData.reason,
      pupilId: pupilData.pupilId,
      userId: retroInputAssistantData.userId,
      checkId: pupilData.currentCheckId
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
