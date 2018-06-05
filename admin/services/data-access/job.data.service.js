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

/**
 * Update job output
 * @param {Number} jobId
 * @param {Number} jobStatusId
 * @param {String} jobOutput
 * @param {String} errorOutput
 * @return {Promise}
 */
jobDataService.updateJobOutput = async (jobId, jobStatusId, jobOutput, errorOutput) => {
  const sql = `UPDATE ${sqlService.adminSchema}.${table}
  SET jobStatus_id=@jobStatusId, jobOutput=@jobOutput, errorOutput=@errorOutput
  WHERE id=@jobId`
  const params = [
    {
      name: 'jobId',
      value: jobId,
      type: TYPES.Int
    },
    {
      name: 'jobStatusId',
      value: jobStatusId,
      type: TYPES.Int
    },
    {
      name: 'jobOutput',
      value: jobOutput,
      type: TYPES.NVarChar
    },
    {
      name: 'errorOutput',
      value: errorOutput,
      type: TYPES.NVarChar
    }
  ]
  return sqlService.modify(sql, params)
}

module.exports = jobDataService
