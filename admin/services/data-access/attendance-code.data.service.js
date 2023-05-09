'use strict'

const { TYPES } = require('./sql.service')
const R = require('ramda')

const sqlService = require('./sql.service')

const attendanceCodeDataService = {
  /**
   * Find Attendance Codes.
   * @returns {Promise<[{id: number, reason: string, code: string, order: number}] | undefined>}
   */
  sqlFindAttendanceCodes: async () => {
    const sql = `SELECT id, reason, code, [order] FROM ${sqlService.adminSchema}.[attendanceCode] WHERE isPrivileged = 0 AND visible = 1`
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
  }
}

module.exports = attendanceCodeDataService
