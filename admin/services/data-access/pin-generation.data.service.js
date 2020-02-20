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
                WHERE school_id=@schoolId
                ORDER BY lastName asc, foreName asc, middleNames asc `
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
      WHERE school_id = @schoolId
      ORDER BY lastName ASC, foreName ASC, middleNames ASC, dateOfBirth ASC
      `
    return sqlService.readonlyQuery(sql, [param])
  },

  /**
   * Batch create checks with pins, now using a stored procedure
   * A pin will be randomly allocated
   *
   * @param {[{pupil_id, checkForm_id, checkWindow_id, isLiveCheck, pinExpiresAt, school_id}]} checks - array of check objects to create
   * @return {Promise<object>}
   */
  sqlCreateBatch: async (checks) => {
    const declareTable = 'declare @tvp as [mtc_admin].CheckTableType'
    const insertHeader = `INSERT into @tvp
        (pupil_id, checkForm_id, checkWindow_id, isLiveCheck, pinExpiresAt, school_id)
        VALUES`
    const inserts = checks.map((check, index) => {
      return `(@pupilId${index}, @checkFormId${index}, @checkWindowId${index}, @isLiveCheck${index}, @pinExpiresAt${index}, @schoolId${index})`
    })
    const params = []
    checks.map((check, index) => {
      params.push({ name: `pupilId${index}`, value: check.pupil_id, type: TYPES.Int })
      params.push({ name: `checkFormId${index}`, value: check.checkForm_id, type: TYPES.Int })
      params.push({ name: `checkWindowId${index}`, value: check.checkWindow_id, type: TYPES.Int })
      params.push({ name: `isLiveCheck${index}`, value: check.isLiveCheck, type: TYPES.Bit })
      params.push({ name: `pinExpiresAt${index}`, value: check.pinExpiresAt.toDate(), type: TYPES.DateTimeOffset })
      params.push({ name: `schoolId${index}`, value: check.school_id, type: TYPES.Int })
    })
    const exec = 'EXEC [mtc_admin].[spCreateChecks] @tvp'
    const insertSql = insertHeader + inserts.join(',\n')
    const sql = [declareTable, insertSql, exec].join(';\n')
    return sqlService.query(sql, params)
  },

  sqlFindActivePinRecordsByPupilUrlSlug: async (urlSlug) => {
    const view = 'vewPupilsWithActivePins'
    const param = { name: 'urlSlug', type: TYPES.UniqueIdentifier, value: urlSlug }
    const sql = `SELECT *
      FROM ${sqlService.adminSchema}.[${view}]
      WHERE urlSlug = @urlSlug`
    return sqlService.query(sql, [param])
  }
}

module.exports = serviceToExport
