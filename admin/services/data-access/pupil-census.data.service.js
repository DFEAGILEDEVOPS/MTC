'use strict'

const R = require('ramda')
const sqlService = require('./sql.service')
const pupilCensusDataService = {}
const table = '[pupilCensus]'

/**
 * Create a new pupil census.
 * @param {object} data
 * @return {Promise}
 */
pupilCensusDataService.sqlCreate = async (data) => {
  return sqlService.create(table, data)
}

/**
 * Find active pupil census record.
 * @return {Object}
 */
pupilCensusDataService.sqlFindOne = async () => {
  const sql = `SELECT TOP 1 * 
  FROM ${sqlService.adminSchema}.${table}
  WHERE isDeleted=0 
  ORDER BY createdAt DESC`
  const result = await sqlService.query(sql, [])
  return R.head(result)
}

module.exports = pupilCensusDataService
