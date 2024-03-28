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
    const arrangementType = await aaDataService.sqlFindAccessArrangementsIdsWithCodes([aaDataService.CODES.INPUT_ASSISTANCE])
    const inputAssistantTypeId = arrangementType[0].id

    const insertData = {
      pupil_id: data.pupilId,
      recordedBy_user_id: data.userId,
      accessArrangements_id: inputAssistantTypeId,
      retroInputAssistantFirstName: data.firstName,
      retroInputAssistantLastName: data.lastName,
      retroInputAssistant_check_id: data.checkId
    }
    return sqlService.create('pupilAccessArrangements', insertData)
  },
  /**
   * @description looks up pupil id and current check id via url slug
   * @param {string} pupilUrlSlug
   * @returns {Promise<any>}
   */
  getPupilIdAndCurrentCheckIdByUrlSlug: async function getPupilIdAndCurrentCheckIdByUrlSlug (pupilUrlSlug) {
    const pupilIdSql = 'SELECT id, currentCheckId FROM mtc_admin.pupil WHERE urlSlug=@pupilUrlSlug'
    return sqlService.readonlyQuery(pupilIdSql, [{
      name: 'pupilUrlSlug',
      type: TYPES.UniqueIdentifier,
      value: pupilUrlSlug
    }])
  },
  sqlFindEligiblePupilsBySchoolId: async function sqlFindEligiblePupilsBySchoolId (schoolId) {
    const params = [
      {
        name: 'schoolId',
        value: schoolId,
        type: TYPES.Int
      }
    ]
    const sql = `
    SELECT
      p.id,
      p.foreName,
      p.lastName,
      p.middleNames,
      p.dateOfBirth,
      p.group_id,
      p.urlSlug
    FROM
      [mtc_admin].[pupil] p
      INNER JOIN [mtc_admin].[check] chk ON (p.currentCheckId = chk.id)
      LEFT JOIN [mtc_admin].pupilAccessArrangements paa ON (chk.id = paa.retroInputAssistant_check_id)
      LEFT JOIN [mtc_admin].checkConfig cc ON (chk.id = cc.check_id)
    WHERE p.school_id = @schoolId
      AND p.attendanceId IS NULL
      AND paa.id IS NULL
      AND chk.complete = 1
      AND JSON_VALUE(cc.payload, '$.inputAssistance') = 'false'
    ORDER BY lastName;
    `
    return sqlService.readonlyQuery(sql, params)
  },
  /**
   * @description marks the latest complete check as input assistant being added after check taken
   * @param {number} checkId
   */
  markLatestCompleteCheckAsInputAssistantAddedRetrospectively: async function markLatestCompleteCheckAsInputAssistantAddedRetrospectively (checkId) {
    return sqlService.update('[check]', {
      id: checkId,
      inputAssistantAddedRetrospectively: 1
    })
  },
  /**
   * @description deletes the input assistant added retrospectively
   * @param {string} pupilUrlSlug
   */
  deleteRetroInputAssistant: async function deleteRetroInputAssistant (pupilUrlSlug) {
    const params = [
      {
        name: 'pupilUrlSlug',
        value: pupilUrlSlug,
        type: TYPES.UniqueIdentifier
      }
    ]
    const sql = `
      DELETE [mtc_admin].[pupilAccessArrangements] WHERE id = (
        SELECT paa.id FROM [mtc_admin].[pupilAccessArrangements] paa
        INNER JOIN [mtc_admin].[pupil] p ON paa.retroInputAssistant_check_id = p.currentCheckId
        WHERE p.urlSlug = @pupilUrlSlug
      )
    `
    return sqlService.modify(sql, params)
  }
}

module.exports = service
