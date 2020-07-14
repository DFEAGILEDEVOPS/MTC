'use strict'

const sqlService = require('./sql.service')
const TYPES = require('./sql.service').TYPES
const aaDataService = require('./access-arrangements.data.service')

const service = {
  /**
   * @typedef {object} retroInputAssistantData
   * @property {string} firstName
   * @property {string} lastName
   * @property {string} reason
   * @property {number} checkId
   * @property {number} pupilId
   * @property {number} userId
   */

  /**
   * @param {retroInputAssistantData} data
   * @returns {Promise<any>}
   */
  create: async function create (data) {
    const retroInputAssistantTypeId = await aaDataService.sqlFindAccessArrangementsIdsWithCodes([aaDataService.CODES.RETRO_INPUT_ASSISTANT])[0].id
    const insertData = {
      pupil_id: data.pupilId,
      recordedBy_user_id: data.userId,
      accessArrangements_id: retroInputAssistantTypeId,
      retroInputAssistantFirstName: data.firstName,
      retroInputAssistantLastName: data.lastName,
      retroInputAssistantReason: data.reason,
      retroInputAssistant_check_id: data.checkId
    }
    return sqlService.create('pupilAccessArrangements', insertData)
  },
  /**
   * @description looks up pupil id and current check id via url slug
   * @param {string} pupilUrlSlug
   * @returns {Promise<any>}
   */
  getPupilIdAndCurrentCheckIdByUrlSlug: function getPupilIdAndCurrentCheckIdByUrlSlug (pupilUrlSlug) {
    const pupilIdSql = 'SELECT id, currentCheckId FROM mtc_admin.pupil WHERE urlSlug=@pupilUrlSlug'
    return sqlService.readonlyQuery(pupilIdSql, [{
      name: 'pupilUrlSlug',
      type: TYPES.UniqueIdentifier,
      value: pupilUrlSlug
    }])
  }
}

module.exports = service
