'use strict'

const R = require('ramda')
const TYPES = require('tedious').TYPES

const sqlService = require('./sql.service')
const jobDataService = {}
const table = '[job]'

/**
 * Create a new job.
 * @param {object} data
 * @return {Promise}
 */
jobDataService.sqlCreate = async (data) => {
  return sqlService.create(table, data)
}

/**
 * Find latest job by type.
 * @param {String} jobTypeCode
 * @return {Object}
 */
jobDataService.sqlFindLatestByType = async (jobTypeCode) => {
  const sql = `SELECT TOP 1 * 
  FROM ${sqlService.adminSchema}.${table}
  WHERE jobTypeCode=@jobTypeCode 
  ORDER BY createdAt DESC`
  const params = [
    {
      name: 'jobTypeCode',
      value: jobTypeCode,
      type: TYPES.Char
    }
  ]
  const result = await sqlService.query(sql, params)
  return R.head(result)
}

module.exports = jobDataService
