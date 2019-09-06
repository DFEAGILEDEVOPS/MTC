'use strict'

const R = require('ramda')
const { TYPES } = require('./sql.service')

const sqlService = require('./sql.service')
const jobDataService = {}
const table = '[job]'

/**
 * Create a new job.
 * @param {object} pupilCensusRecord
 * @return {Promise}
 */
jobDataService.sqlCreate = async (pupilCensusRecord) => {
  const sql = `INSERT INTO ${sqlService.adminSchema}.${table}
  (jobInput, jobType_id, jobStatus_id)
  OUTPUT inserted.id, inserted.urlSlug
  VALUES (@jobInput, @jobType_id, @jobStatus_id)`
  const params = [
    {
      name: 'jobInput',
      value: pupilCensusRecord.jobInput,
      type: TYPES.NVarChar
    },
    {
      name: 'jobType_id',
      value: pupilCensusRecord.jobType_id,
      type: TYPES.Int
    },
    {
      name: 'jobStatus_id',
      value: pupilCensusRecord.jobStatus_id,
      type: TYPES.Int
    }
  ]
  const result = await sqlService.query(sql, params)
  return R.head(result)
}

/**
 * Find job by id.
 * @param {Number} jobId
 * @return {Promise<Object>}
 */
jobDataService.sqlFindById = async (jobId) => {
  const sql = `SELECT TOP 1 *
  FROM ${sqlService.adminSchema}.${table}
  WHERE id=@jobId`
  const params = [
    {
      name: 'jobId',
      value: jobId,
      type: TYPES.Int
    }
  ]
  const result = await sqlService.query(sql, params)
  return R.head(result)
}

/**
 * Find latest job by type id.
 * @param {Number} jobTypeId
 * @return {Promise<Object>}
 */
jobDataService.sqlFindLatestByTypeId = async (jobTypeId) => {
  const sql = `SELECT TOP 1
  j.*,
  js.jobStatusCode,
  js.description as jobStatusDescription
  FROM ${sqlService.adminSchema}.${table} j
  INNER JOIN ${sqlService.adminSchema}.[jobStatus] js
    ON  js.id = j.jobStatus_id
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
jobDataService.sqlUpdate = async (jobId, jobStatusId, jobOutput = undefined, errorOutput = undefined) => {
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

/**
 * Update pupil census job status
 * @param {String} urlSlug
 * @param {String} jobStatusCode
 * @param {String} jobOutput
 * @param {String} errorOutput
 * @return {Promise}
 */
jobDataService.sqlUpdateStatus = async (urlSlug, jobStatusCode, jobOutput = undefined, errorOutput = undefined) => {
  const sql = `UPDATE ${sqlService.adminSchema}.${table}
  SET
  jobStatus_id = (
    SELECT id
    FROM ${sqlService.adminSchema}.[jobStatus]
    WHERE jobStatusCode = @jobStatusCode
  ),
  jobOutput=@jobOutput,
  errorOutput=@errorOutput
  WHERE urlSlug=@urlSlug`
  const params = [
    {
      name: 'urlSlug',
      value: urlSlug,
      type: TYPES.UniqueIdentifier
    },
    {
      name: 'jobStatusCode',
      value: jobStatusCode,
      type: TYPES.Char
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
