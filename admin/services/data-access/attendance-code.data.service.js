'use strict'

const sqlService = require('./sql.service')

const attendanceCodeDataService = {}
const table = '[attendanceCode]'

attendanceCodeDataService.sqlFindStatusCodes = async () => {
  // TODO: data-refactor: candidate for caching
  const sql = `SELECT code, reason FROM ${table}`
  return sqlService.query(sql)
}

module.exports = attendanceCodeDataService
