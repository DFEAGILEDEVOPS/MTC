'use strict'

const sqlService = require('./sql.service')
const TYPES = require('./sql.service').TYPES

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
    const insertData = {
      pupil_id: pupilId,
      recordedBy_user_id: data.userId
    }
    const insertResult = sqlService.create('pupilAccessArrangements',)
  }
}

module.exports = service
