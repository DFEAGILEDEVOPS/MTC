'use strict'

const { TYPES } = require('./sql.service')
const sqlService = require('./sql.service')

const serviceToExport = {
  /**
   *
   * @param {number} schoolId
   * @param {boolean} isLiveCheck
   * @return {Promise<*>}
   */
  sqlFindEligiblePupilsBySchool: async (schoolId, isLiveCheck) => {
    const view = isLiveCheck === true ? 'vewPupilsEligibleForLivePinGeneration' : 'vewPupilsEligibleForTryItOutPin'
    const sql = `SELECT
                  *
                FROM ${sqlService.adminSchema}.${view}
                WHERE school_id=@schoolId`
    const params = [
      {
        name: 'schoolId',
        value: schoolId,
        type: TYPES.Int
      }
    ]
    return sqlService.readonlyQuery(sql, params)
  },

  sqlFindPupilsWithActivePins: async (schoolId, isLiveCheck) => {
    const view = isLiveCheck ? 'vewPupilsWithActiveLivePins' : 'vewPupilsWithActiveFamiliarisationPins'
    const param = { name: 'schoolId', type: TYPES.Int, value: schoolId }
    const sql = `
      SELECT
        *
      FROM ${sqlService.adminSchema}.[${view}]
      WHERE school_id = @schoolId`
    return sqlService.readonlyQuery(sql, [param])
  },

  /**
   * @typedef CreateCheck
   * @property {number} checkForm_id
   * @property {number} checkWindow_id
   * @property {import('moment').Moment} createdBy_userId
   * @property {boolean} isLiveCheck
   * @property {import('moment').Moment} pinExpiresAt
   * @property {number} pupil_id
   * @property {number} school_id
   */

  /**
   * Batch create checks with pins, now using a stored procedure
   * A pin will be randomly allocated
   *
   * @param {Array<CreateCheck>} checks - array of check objects to create
   * @return {Promise<object>}
   */
  sqlCreateBatch: async (checks) => {
    const declareTable = 'declare @tvp as [mtc_admin].CheckTableType'
    const insertHeader = `INSERT into @tvp
        (pupil_id, checkForm_id, checkWindow_id, isLiveCheck, pinExpiresAt, school_id, createdBy_userId)
        VALUES`
    const inserts = checks.map((check, index) => {
      return `(@pupilId${index}, @checkFormId${index}, @checkWindowId${index}, @isLiveCheck${index}, @pinExpiresAt${index}, @schoolId${index}, @createdBy_userId${index})`
    })
    const params = []
    checks.forEach((check, index) => {
      params.push({ name: `pupilId${index}`, value: check.pupil_id, type: TYPES.Int })
      params.push({ name: `checkFormId${index}`, value: check.checkForm_id, type: TYPES.Int })
      params.push({ name: `checkWindowId${index}`, value: check.checkWindow_id, type: TYPES.Int })
      params.push({ name: `isLiveCheck${index}`, value: check.isLiveCheck, type: TYPES.Bit })
      params.push({ name: `pinExpiresAt${index}`, value: check.pinExpiresAt.toDate(), type: TYPES.DateTimeOffset })
      params.push({ name: `schoolId${index}`, value: check.school_id, type: TYPES.Int })
      params.push({ name: `createdBy_userId${index}`, value: check.createdBy_userId, type: TYPES.Int })
    })
    const exec = 'EXEC [mtc_admin].[spCreateChecks] @tvp'
    const insertSql = insertHeader + inserts.join(',\n')
    const sql = [declareTable, insertSql, exec].join(';\n')
    return sqlService.query(sql, params)
  }
}

module.exports = serviceToExport
