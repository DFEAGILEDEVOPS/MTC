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
 * Find latest job by type id.
 * @param {Number} jobTypeId
 * @return {Object}
 */
jobDataService.sqlFindLatestByTypeId = async (jobTypeId) => {
  const sql = `SELECT TOP 1 * 
  FROM ${sqlService.adminSchema}.${table}
  WHERE jobType_id=@jobTypeId 
  ORDER BY createdAt DESC`
  const params = [
    {
      name: 'jobTypeId',
      value: jobTypeId,
      type: TYPES.Int
    }
  ]
  const result = await sqlService.query(sql, params)
  return R.head(result)
}

module.exports = jobDataService
