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

    const paaTableInsertData = {
      pupil_id: data.pupilId,
      recordedBy_user_id: data.userId,
      accessArrangements_id: inputAssistantTypeId,
      inputAssistanceInformation: data.reason
    }
    await sqlService.create('pupilAccessArrangements', paaTableInsertData)

    const ciaInsertData = {
      pupil_id: data.pupilId,
      foreName: data.firstName,
      lastName: data.lastName,
      check_id: data.checkId,
      isRetrospective: true
    }
    return sqlService.create('checkInputAssistant', ciaInsertData)
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
      LEFT JOIN [mtc_admin].checkInputAssistant cia ON (chk.id = cia.check_id)
      LEFT JOIN [mtc_admin].pupilAccessArrangements paa ON (cia.pupil_id = paa.pupil_id)
    WHERE p.school_id = @schoolId
      AND p.attendanceId IS NULL
      AND chk.complete = 1
      AND p.id NOT IN (SELECT pupil_id FROM [mtc_admin].[checkInputAssistant] WHERE isRetrospective = 1)
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
      DECLARE @pupilId INT = (SELECT id FROM [mtc_admin].[pupil] WHERE urlSlug = @pupilUrlSlug);
      DECLARE @inputAssistantTypeId INT = (SELECT id FROM [mtc_admin].[accessArrangements] WHERE code = '${aaDataService.CODES.INPUT_ASSISTANCE}');
      DECLARE @pupilAccessArrangementsId INT =
        (SELECT id FROM [mtc_admin].[pupilAccessArrangements]
        WHERE pupil_id = @pupilId
        AND accessArrangements_id = @inputAssistantTypeId);

      DELETE [mtc_admin].[pupilAccessArrangements] WHERE id = @pupilAccessArrangementsId;
      DELETE [mtc_admin].[checkInputAssistant] WHERE pupil_id = @pupilId AND isRetrospective = 1;
    `

    return sqlService.modifyWithTransaction(sql, params)
  }
}

module.exports = service
