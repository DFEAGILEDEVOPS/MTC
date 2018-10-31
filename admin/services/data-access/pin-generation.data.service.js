'use strict'

const { TYPES } = require('tedious')
const sqlService = require('./sql.service')
const monitor = require('../../helpers/monitor')

const serviceToExport = {
  /**
   *
   * @param {number} schoolId
   * @param {boolean} isLiveCheck
   * @return {Promise<*>}
   */
  sqlFindEligiblePupilsBySchool: async (schoolId, isLiveCheck) => {
    const view = isLiveCheck === true ? 'vewPupilsEligibleForLivePinGeneration' : 'vewPupilsEligibleForFamiliarisationPinGeneration';
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
    return sqlService.query(sql, params)
  },

  sqlFindPupilsWithActivePins: async (schoolId, isLiveCheck) => {
    console.log('sqlFindPupilsWithActivePins: ', isLiveCheck)
    const view = isLiveCheck ? 'vewPupilsWithActiveLivePins' : 'vewPupilsWithActiveFamiliarisationPins';
    const param = { name: 'schoolId', type: TYPES.Int, value: schoolId }
    const sql = `
      SELECT 
        *
      FROM ${sqlService.adminSchema}.[${view}] 
      WHERE school_id = @schoolId
      ORDER BY lastName ASC, foreName ASC, middleNames ASC, dateOfBirth ASC
      `
    return sqlService.query(sql, [param])
  },

  sqlFindPupilsEligibleForPinGenerationById: async (schoolId, pupilIds, isLiveCheck) => {
    const view = isLiveCheck ? 'vewPupilsEligibleForLivePinGeneration' : 'vewPupilsEligibleForFamiliarisationPinGeneration'
    const select = `SELECT * 
                    FROM ${sqlService.adminSchema}.[${view}]`
    let { params, paramIdentifiers } = sqlService.buildParameterList(pupilIds, TYPES.Int)
    const whereClause = `WHERE id IN (${paramIdentifiers.join(', ')}) AND school_id = @schoolId`
    params.push({
      name: 'schoolId',
      value: schoolId,
      type: TYPES.Int
    })
    const sql = [ select, whereClause ].join(' ')
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
    const updates = updateData.map((data, index) => `UPDATE ${sqlService.adminSchema}.[pupilRestart] SET check_id = @checkId${index} WHERE id = @pupilRestartId${index}`)
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
      params.push({ name: `pinExpiresAt${index}`, value: check.pinExpiresAt, type: TYPES.DateTimeOffset })
      params.push({ name: `schoolId${index}`, value: check.school_id, type: TYPES.Int })
    })
    const exec = 'EXEC [mtc_admin].[spCreateChecks] @tvp'
    const insertSql = insertHeader + inserts.join(',\n')
    const sql = [declareTable, insertSql, exec].join(';\n')
    return sqlService.modify(sql, params)
  }
}

module.exports = monitor('pin-generation.data.service', serviceToExport)
