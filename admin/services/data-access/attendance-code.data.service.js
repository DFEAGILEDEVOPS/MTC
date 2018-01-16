'use strict'

const sqlService = require('./sql.service')

const attendanceCodeDataService = {
  sqlFindAttendanceCodes: async () => {
    const sql = `SELECT id, reason, code FROM ${sqlService.adminSchema}.[attendanceCode] ORDER BY [order]`
    return sqlService.query(sql)
  }
}

module.exports = attendanceCodeDataService
