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
    console.dir(pupilData)
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
  }
}

module.exports = service
