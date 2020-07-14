'use strict'

const validator = require('../lib/validator/retro-input-assistant-validator')
const dataService = require('./data-access/retro-input-assistant.data.service')

const service = {
  /**
   * @typedef {object} retroInputAssistantData
   * @property {string} firstName
   * @property {string} lastName
   * @property {string} reason
   * @property {number} checkId
   * @property {string} pupilUuid
   * @property {number} userId
   */

  /**
    * @description persists retrospective input assistant data
    * @param {retroInputAssistantData} retroInputAssistantData
    */
  save: async function add (retroInputAssistantData) {
    const validationResult = validator.validate(retroInputAssistantData)
    if (validationResult.hasError()) {
      throw validationResult
    }
    return dataService.create(retroInputAssistantData)
  }
}

module.exports = service
