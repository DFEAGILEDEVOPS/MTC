'use strict'

const { TYPES } = require('./sql.service')
const R = require('ramda')

const sqlService = require('./sql.service')

const attendanceCodeDataService = {
  /**
   * Find Permitted Attendance Codes (by role)
   * @returns {Promise<[{id: number, reason: string, code: string, order: number}] | undefined>}
   */
  sqlFindAttendanceCodes: async (role) => {
    const sql = `
      SELECT
        attendanceCodeId as id,
        attendanceCodeReason as reason,
        attendanceCode as code,
        attendanceCodeDisplayOrder as [order]
      FROM
        [mtc_admin].[vewAttendanceCodePermissions]
      WHERE
        attendanceCodeIsVisible = 1
      and roleTitle = @role`
    const params = [
      { name: 'role', type: TYPES.NVarChar, value: role }
    ]
    return sqlService.readonlyQuery(sql, params)
  },

  /**
   * Find attendance code by code.
   * @param {string} code - attendanceCode.code value
   * @param {string} role - TEACHER / HELPDESK / SERVICE-MANAGER ...
   * @returns {Promise<object>}
   */
  sqlFindOneAttendanceCodeByCode: async (code, role) => {
    const sql = `
    SELECT
      attendanceCodeId as id,
      attendanceCodeReason as reason,
      attendanceCode as code
    FROM
      [mtc_admin].[vewAttendanceCodePermissions]
    WHERE
      [code] = @pcode
    AND
      roleTitle = @role`
    const params = [
      { name: 'pcode', value: code, type: TYPES.Char },
      { name: 'role', type: TYPES.NVarChar, value: role }
    ]
    const res = await sqlService.readonlyQuery(sql, params)
    return R.head(res)
  }
}

module.exports = attendanceCodeDataService
