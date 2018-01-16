'use strict'

const sqlService = require('./sql.service')

const pupilStatusCodeDataService = {}
const table = '[pupilStatusCode]'

/**
 * Return a list of pupil status codes
 * @return {Promise<results>}
 */
pupilStatusCodeDataService.sqlFindStatusCodes = async () => {
  // TODO: data-refactor: candidate for caching
  const sql = `SELECT code, statusDesc FROM ${table} ORDER By statusDesc ASC`
  return sqlService.query(sql)
}

module.exports = pupilStatusCodeDataService
