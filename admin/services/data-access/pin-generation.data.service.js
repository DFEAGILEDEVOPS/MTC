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
   * Find checks that are being re-started
   * @param {number} schoolId
   * @param {[number]} checkIds - all check Ids generated during pin generation
   * @param {[number]} pupilIds - pupils known to be doing a restart
   */
  sqlFindChecksForPupilsById: async (schoolId, checkIds, pupilIds) => {
    const select = `SELECT c.*
                    FROM ${sqlService.adminSchema}.[check] c
                      JOIN ${sqlService.adminSchema}.[pupil] p ON (c.pupil_id = p.id)`
    const schoolParam = {
      name: 'schoolId',
      value: schoolId,
      type: TYPES.Int
    }
    const checkParams = checkIds.map((checkId, index) => { return { name: `checkId${index}`, value: checkId, type: TYPES.Int } })
    const checkIdentifiers = checkIds.map((checkId, index) => `@checkId${index}`)
    const pupilParams = pupilIds.map((pupilId, index) => { return { name: `pupilId${index}`, value: pupilId, type: TYPES.Int } })
    const pupilIdentifiers = pupilIds.map((pupilId, index) => `@pupilId${index}`)
    const whereClause = `WHERE p.school_id = @schoolId
                         AND c.id IN (${checkIdentifiers.join(', ')})
                         AND c.pupil_id IN (${pupilIdentifiers.join(', ')})`
    const sql = [select, whereClause].join('\n')
    // We need to query the master DB, so make sure to use `query` and not `readOnlyQuery`.  This read is executed
    // directly after the write.
    return sqlService.query(sql, [schoolParam].concat(checkParams).concat(pupilParams))
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
