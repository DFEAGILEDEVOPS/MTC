'use strict'

const { TYPES } = require('tedious')
const sqlService = require('less-tedious')

const table = '[job]'

const jobDataService = {}

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
