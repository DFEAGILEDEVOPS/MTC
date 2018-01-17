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
  const sql = `
  SELECT 
    id, 
    code, 
    statusDesc 
  FROM ${sqlService.adminSchema}.${table} 
  ORDER BY statusDesc ASC`
  return sqlService.query(sql)
}

module.exports = pupilStatusCodeDataService
