'use strict'
const sqlService = require('../../../lib/sql/sql.service')
const { TYPES } = sqlService
const R = require('ramda')

/**
 * Psychometrician data service - test developer role can access all pupils
 */
const psychometricianDataService = {

  /**
   * Find any pupils by ids
   * @param ids
   * @return {Promise<void>}
   */
  sqlFindPupilsByIds: async (ids) => {
    if (!(Array.isArray(ids) && ids.length > 0)) {
      throw new Error('No ids provided')
    }
    const select = `
    SELECT *
    FROM [mtc_admin].[pupil]
    `
    const { params, paramIdentifiers } = sqlService.buildParameterList(ids, TYPES.Int)
    const whereClause = 'WHERE id IN (' + paramIdentifiers.join(', ') + ')'
    const sql = [select, whereClause].join(' ')
    return sqlService.query(sql, params)
  },

  /**
   *
   * @param {Array<object>} batchIds array of integers
   * @return {Promise<Array>}
   */
  sqlFindCompletedChecksByIds: async function sqlFindCompletedChecksByIds (batchIds) {
    const select = `
      SELECT
      chk.*,
      cr.payload,
      cs.code,
      cs.description,
      prr.code restartCode,
      (
        SELECT COUNT(id)
        FROM [mtc_admin].[pupilRestart] pr
        WHERE pr.pupil_id = chk.pupil_id
        AND pr.createdAt < chk.createdAt
        AND pr.isDeleted = 0
      ) restartCount,
      ac.code attendanceCode
      FROM [mtc_admin].[check] chk
          LEFT JOIN [mtc_admin].[checkResult] cr ON (chk.id = cr.check_id)
          LEFT JOIN [mtc_admin].[pupilRestart] pr ON (pr.check_id = chk.id AND pr.isDeleted = 0)
          LEFT JOIN [mtc_admin].[pupilRestartReason] prr ON (prr.id = pr.pupilRestartReason_id)
          LEFT JOIN [mtc_admin].[pupilAttendance] pa ON (pa.pupil_id = chk.pupil_id AND pa.isDeleted = 0)
          LEFT JOIN [mtc_admin].[attendanceCode] ac ON (ac.id = pa.attendanceCode_id AND pa.isDeleted = 0)
          JOIN [mtc_admin].[checkStatus] cs ON (chk.checkStatus_id = cs.id)`
    const where = sqlService.buildParameterList(batchIds, TYPES.Int)
    const sql = [select, 'WHERE chk.id IN (', where.paramIdentifiers.join(', '), ')'].join(' ')
    // Populate the JSON data structure which is stored as a string in the SQL DB
    const results = await sqlService.query(sql, where.params)
    const parsed = results.map(x => {
      if (!x.payload) {
        return R.clone(x)
      }
      const parsedPayload = JSON.parse(x.payload)
      return R.assoc('data', parsedPayload, R.omit(['payload'], x))
    })
    return parsed
  },

  /**
   * Find checkForms by their Ids
   * @param ids
   * @return {Promise<*>}
   */
  getCheckFormsByIds: async (ids) => {
    if (!ids || !Array.isArray((ids))) {
      throw new Error('ids list empty or not defined')
    }
    const select = `
      SELECT *
      FROM [mtc_admin].[checkForm]`
    const { params, paramIdentifiers } = sqlService.buildParameterList(ids, TYPES.Int)
    const whereClause = 'WHERE id IN (' + paramIdentifiers.join(', ') + ')'
    const sql = [select, whereClause].join(' ')
    const result = await sqlService.query(sql, params)
    const checkForms = result.map(cf => {
      cf.formData = JSON.parse(cf.formData)
      return cf
    })
    return checkForms
  },

  /**
   * Find school by array of ids.
   * @param {Number[]}ids
   * @returns {Promise<*>}
   */
  sqlFindSchoolsByIds: async (ids) => {
    if (!(Array.isArray(ids) && ids.length > 0)) {
      throw new Error('No ids provided')
    }
    const select = `
    SELECT *
    FROM [mtc_admin].[school]
    `
    const { params, paramIdentifiers } = sqlService.buildParameterList(ids, TYPES.Int)
    const whereClause = 'WHERE id IN (' + paramIdentifiers.join(', ') + ')'
    const sql = [select, whereClause].join(' ')
    return sqlService.query(sql, params)
  },

  /**
   * Find all answers that match the supplied array of checkIds
   * Used in processing the psychometric report
   * @param checkIds
   * @return {Promise<*>}
   */
  sqlFindAnswersByCheckIds: async (checkIds) => {
    const select = 'SELECT * FROM [mtc_admin].[answer] WHERE check_id IN'
    const whereParams = sqlService.buildParameterList(checkIds, TYPES.Int)
    const sql = [select, '(', whereParams.paramIdentifiers, ')'].join(' ')
    const results = await sqlService.query(sql, whereParams.params)
    const byCheckId = {}
    results.forEach((answer) => {
      if (!byCheckId[answer.check_id]) {
        byCheckId[answer.check_id] = []
      }
      byCheckId[answer.check_id].push(answer)
    })
    return byCheckId
  },

  /**
   * Returns the joined selection of check and check forms with check.data parsed
   * @param {Array<object>} batchIds array of integers
   * @return {Promise<Array>}
   */
  sqlFindChecksByIdsWithForms: async function sqlFindChecksByIdsWithForms (batchIds) {
    const select = `
      SELECT
             chk.*,
             f.formData,
             cr.payload
      FROM [mtc_admin].[check] chk JOIN
        [mtc_admin].[checkResult] cr on (chk.id = cr.check_id) JOIN
        [mtc_admin].[checkForm] f ON chk.checkForm_id = f.id
      `
    const where = sqlService.buildParameterList(batchIds, TYPES.Int)
    const sql = [select, 'WHERE chk.id IN (', where.paramIdentifiers.join(', '), ')'].join(' ')
    // Populate the JSON data structure which is stored as a string in the SQL DB
    const results = await sqlService.query(sql, where.params)
    const parsed = results.map(x => {
      if (!x.payload) {
        return R.clone(x)
      }
      const transformations = {
        formData: JSON.parse,
        payload: JSON.parse
      }
      const d1 = R.evolve(transformations, x)
      return R.assoc('data', d1.payload, R.omit(['payload'], d1))
    })
    return parsed
  }
}

module.exports = psychometricianDataService
