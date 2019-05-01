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
    let sql
    if (!isLiveCheck) {
      sql = ` SELECT
                  p.id,
                  p.foreName,
                  p.middleNames,
                  p.lastName,
                  p.dateOfBirth,
                  p.school_id,
                  g.group_id,
                  p.urlSlug
              FROM
                [mtc_admin].[pupil] p
                  LEFT JOIN [mtc_admin].[pupilAttendance] pa ON (p.id = pa.pupil_id and pa.isDeleted = 0)
                  LEFT JOIN [mtc_admin].[attendanceCode] ac ON (pa.attendanceCode_id = ac.id )
                  LEFT JOIN  [mtc_admin].[pupilGroup] g ON (g.pupil_id = p.id)
                  INNER JOIN [mtc_admin].[pupilStatus] ps ON (p.pupilStatus_id = ps.id)
              WHERE
                -- include all pupils except those who are marked as not taking check because they left school
                (ac.id IS NULL OR ac.code <> 'LEFTT')
              AND    ps.code IN ('UNALLOC',
                                'ALLOC',
                                'LOGGED_IN')
              AND school_id = ${schoolId}
                  -- Exclude pupils who already have an active familiarisation check
              AND p.id NOT IN (SELECT
                  p.id
              FROM
                [mtc_admin].[pupil] p
                  LEFT JOIN [mtc_admin].[check] AS chk ON (p.id = chk.pupil_id)
                  LEFT JOIN [mtc_admin].[checkStatus] AS chkStatus ON (chk.checkStatus_id = chkStatus.id)
              WHERE  chk.isLiveCheck = 0
                AND    chkStatus.code IN ('NEW', 'STD', 'COL')
                AND p.school_id = ${schoolId})
      `
    } else {
      sql = `SELECT
                  *
                FROM mtc_admin.vewPupilsEligibleForLivePinGeneration
                WHERE school_id=@schoolId
                ORDER BY lastName asc, foreName asc, middleNames asc `
    }
    const params = [
      {
        name: 'schoolId',
        value: schoolId,
        type: TYPES.Int
      }
    ]
    return sqlService.query(sql, params)
  },

  sqlFindPupilsWithActivePins: async (schoolId, isLiveCheck) => {
    const view = isLiveCheck ? 'vewPupilsWithActiveLivePins' : 'vewPupilsWithActiveFamiliarisationPins'
    const param = { name: 'schoolId', type: TYPES.Int, value: schoolId }
    const sql = `
      SELECT
        *
      FROM [mtc_admin].[${view}]
      WHERE school_id = @schoolId
      ORDER BY lastName ASC, foreName ASC, middleNames ASC, dateOfBirth ASC
      `
    return sqlService.query(sql, [param])
  },

  sqlFindPupilsEligibleForPinGenerationById: async (schoolId, pupilIds, isLiveCheck) => {
    let sql
    let { params, paramIdentifiers } = sqlService.buildParameterList(pupilIds, TYPES.Int)
    if (!isLiveCheck) {
      sql = ` SELECT
                  p.id,
                  p.foreName,
                  p.middleNames,
                  p.lastName,
                  p.dateOfBirth,
                  p.school_id,
                  g.group_id,
                  p.urlSlug
              FROM
                [mtc_admin].[pupil] p
                  LEFT JOIN [mtc_admin].[pupilAttendance] pa ON (p.id = pa.pupil_id and pa.isDeleted = 0)
                  LEFT JOIN [mtc_admin].[attendanceCode] ac ON (pa.attendanceCode_id = ac.id )
                  LEFT JOIN  [mtc_admin].[pupilGroup] g ON (g.pupil_id = p.id)
                  INNER JOIN [mtc_admin].[pupilStatus] ps ON (p.pupilStatus_id = ps.id)
              WHERE
                -- include all pupils except those who are marked as not taking check because they left school
                (ac.id IS NULL OR ac.code <> 'LEFTT')
              AND    ps.code IN ('UNALLOC',
                                'ALLOC',
                                'LOGGED_IN')
              AND school_id = ${schoolId}
              AND p.id IN (${paramIdentifiers.join(', ')})
                  -- Exclude pupils who already have an active familiarisation check
              AND p.id NOT IN (SELECT
                  p.id
              FROM
                [mtc_admin].[pupil] p
                  LEFT JOIN [mtc_admin].[check] AS chk ON (p.id = chk.pupil_id)
                  LEFT JOIN [mtc_admin].[checkStatus] AS chkStatus ON (chk.checkStatus_id = chkStatus.id)
              WHERE  chk.isLiveCheck = 0
                AND    chkStatus.code IN ('NEW', 'STD', 'COL')
                AND p.school_id = ${schoolId})
      `
    } else {
      sql = `SELECT
                  *
                FROM mtc_admin.vewPupilsEligibleForLivePinGeneration
                WHERE id IN (${paramIdentifiers.join(', ')}) AND school_id = @schoolId`
    }
    params.push({
      name: 'schoolId',
      value: schoolId,
      type: TYPES.Int
    })
    return sqlService.query(sql, params)
  },

  /**
   * Find checks that are being re-started
   * @param {number} - schoolId
   * @param {[number]} checkIds - all check Ids generated during pin generation
   * @param {[number]} pupilIds - pupils known to be doing a restart
   */
  sqlFindChecksForPupilsById: async (schoolId, checkIds, pupilIds) => {
    const select = `SELECT c.*
                    FROM [mtc_admin].[check] c
                      JOIN [mtc_admin].[pupil] p ON (c.pupil_id = p.id)`
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
    return sqlService.query(sql, [schoolParam].concat(checkParams).concat(pupilParams))
  },

  /**
   * Update one or more pupilRestarts with the checkId that consumed the restart
   * This happens at pin generation.
   * @param updateData - [ { pupilRestartId: 2, checkId: 3}, [...] ]
   */
  updatePupilRestartsWithCheckInformation: async (updateData) => {
    const restartIdParams = updateData.map((data, index) => { return { name: `checkId${index}`, value: data.checkId, type: TYPES.Int } })
    const pupilRestartParams = updateData.map((data, index) => { return { name: `pupilRestartId${index}`, value: data.pupilRestartId, type: TYPES.Int } })
    const updates = updateData.map((data, index) => `UPDATE [mtc_admin].[pupilRestart] SET check_id = @checkId${index} WHERE id = @pupilRestartId${index}`)
    return sqlService.modify(updates.join(';\n'), restartIdParams.concat(pupilRestartParams))
  },

  /**
   * Batch create checks with pins, now using a stored procedure
   * A pin will be randomly allocated
   *
   * @param {[{pupilId, checkFormId, checkWindowId, isLiveCheck, pinExpiresAt, schoolId}]} checks - array of check objects to create
   * @return {Promise<void>}
   */
  sqlCreateBatch: async (checks) => {
    const declareTable = `declare @tvp as [mtc_admin].CheckTableType`
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
    const res = await sqlService.query(sql, params)
    const insertedIds = []
    res.forEach(row => {
      insertedIds.push(row.id)
    })
    return { insertId: insertedIds }
  },

  sqlFindActivePinRecordsByUrlSlug: async (urlSlug) => {
    const view = 'vewPupilsWithActivePins'
    const param = { name: 'urlSlug', type: TYPES.UniqueIdentifier, value: urlSlug }
    const sql = `SELECT *
      FROM [mtc_admin].[${view}]
      WHERE urlSlug = @urlSlug`
    return sqlService.query(sql, [param])
  }
}

module.exports = serviceToExport
