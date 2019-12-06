'use strict'

const { TYPES } = require('./sql.service')
const R = require('ramda')

const sqlService = require('./sql.service')

const attendanceCodeDataService = {
  /**
   * Find Attendance Codes.
   * @returns {Promise<*>}
   */
  sqlFindAttendanceCodes: async () => {
    const sql = `SELECT id, reason, code FROM ${sqlService.adminSchema}.[attendanceCode] ORDER BY [order]`
    return sqlService.readonlyQuery(sql)
  },

  /**
   * Find attendance code by code.
   * @param code
   * @returns {Promise<object>}
   */
  sqlFindOneAttendanceCodeByCode: async (code) => {
    const sql = `
    SELECT
      id,
      reason,
      [code]
    FROM ${sqlService.adminSchema}.[attendanceCode]
    WHERE [code] = @pcode`
    const paramCode = { name: 'pcode', value: code, type: TYPES.Char }
    const res = await sqlService.readonlyQuery(sql, [paramCode])
    return R.head(res)
  },

  /**
   * Find all unconsumed restarts for pupils
   */
  sqlDeleteUnconsumedRestarts: async (pupilIds, userId) => {
    const { params, paramIdentifiers } = sqlService.buildParameterList(pupilIds, TYPES.Int)
    const sql = `UPDATE [mtc_admin].[pupilRestart]
                 SET isDeleted = 1, deletedByUser_id = @userId
                 WHERE pupil_id IN (${paramIdentifiers.join(', ')})
                 AND isDeleted = 0
                 AND check_id IS NULL`
    params.push({
      name: 'userId', value: userId, type: TYPES.Int
    })

    return sqlService.modify(sql, params)
  }
}

module.exports = attendanceCodeDataService
