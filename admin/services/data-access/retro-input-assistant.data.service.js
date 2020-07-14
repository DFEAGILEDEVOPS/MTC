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
   * @property {string} pupilUuid
   * @property {number} userId
   */

  /**
   *
   * @param {retroInputAssistantData} data
   * @returns {Promise<any>}
   */
  create: async function create (data) {
    const pupilIdSql = 'SELECT id FROM mtc_admin.pupil WHERE urlSlug=@pupilUuid'
    const pupilIdResult = await sqlService.readonlyQuery(pupilIdSql, [{
      name: 'pupilUuid',
      type: TYPES.UniqueIdentifier,
      value: data.pupilUuid
    }])
    const pupilId = pupilIdResult[0]
    if (!pupilId) {
      throw new Error(`Unable to save retro input assistant to database.\npupil with urlSlug:${data.pupilUuid} not found`)
    }

    const retroInputAssistantTypeId = await aaDataService.sqlFindAccessArrangementsIdsWithCodes([aaDataService.CODES.RETRO_INPUT_ASSISTANT])[0].id
    const insertData = {
      pupil_id: pupilId,
      recordedBy_user_id: data.userId,
      accessArrangements_id: retroInputAssistantTypeId,
      retroInputAssistantFirstName: data.firstName,
      retroInputAssistantLastName: data.lastName,
      retroInputAssistantReason: data.reason,
      retroInputAssistant_check_id: data.checkId
    }
    return sqlService.create('pupilAccessArrangements', insertData)
  }
}

module.exports = service
