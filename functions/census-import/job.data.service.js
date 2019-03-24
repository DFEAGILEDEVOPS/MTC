'use strict'

const mssql = require('mssql')

const jobDataService = {}

/**
 * Update pupil census job status
 * @param {Object} pool
 * @param {String} urlSlug
 * @param {String} jobStatusCode
 * @param {String} jobOutput
 * @param {String} errorOutput
 * @return {Promise}
 */
jobDataService.sqlUpdateStatus = async (pool, urlSlug, jobStatusCode, jobOutput = undefined, errorOutput = undefined) => {
  const sql = `UPDATE [mtc_admin].[job]
  SET
  jobStatus_id = (
    SELECT id
    FROM [mtc_admin].[jobStatus]
    WHERE jobStatusCode = @jobStatusCode
  ),
  jobOutput=@jobOutput,
  errorOutput=@errorOutput
  WHERE urlSlug=@urlSlug`

  const request = new mssql.Request(pool)
  request.input('urlSlug', sql.UniqueIdentifier, urlSlug)
  request.input('jobStatusCode', sql.Char, jobStatusCode)
  request.input('jobOutput', sql.NVarChar, jobOutput)
  request.input('errorOutput', sql.NVarChar, errorOutput)
  return request.query(sql)
}

module.exports = jobDataService
