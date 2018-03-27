'use strict'

const {TYPES} = require('tedious')
const R = require('ramda')

const sqlService = require('./sql.service')

const attendanceCodeDataService = {
  /**
   * Find Attendance Codes.
   * @returns {Promise<*>}
   */
  sqlFindAttendanceCodes: async () => {
    const sql = `SELECT id, reason, code FROM ${sqlService.adminSchema}.[attendanceCode] ORDER BY [order]`
    return sqlService.query(sql)
  },

  /**
   * Find attendance code by code.
   * @param code
   * @returns {Promise<void>}
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
    const res = await sqlService.query(sql, [paramCode])
    return R.head(res)
  }
}

module.exports = attendanceCodeDataService
