'use strict'

const R = require('ramda')
const sqlService = require('./sql.service')
const TYPES = require('tedious').TYPES
const monitor = require('../../helpers/monitor')

const jobStatusDataService = {}
const table = '[jobStatus]'

/**
 * Find job status by type code.
 * @return {Object}
 */
jobStatusDataService.sqlFindOneByTypeCode = async (jobStatusCode) => {
  const sql = `SELECT * 
  FROM ${sqlService.adminSchema}.${table}
  WHERE jobStatusCode=@jobStatusCode`
  const params = [
    {
      name: 'jobStatusCode',
      value: jobStatusCode,
      type: TYPES.Char
    }
  ]
  const result = await sqlService.query(sql, params)
  return R.head(result)
}

/**
 * Find job status by id.
 * @return {Object}
 */
jobStatusDataService.sqlFindOneById = async (id) => {
  const sql = `SELECT * 
  FROM ${sqlService.adminSchema}.${table}
  WHERE id=@id`
  const params = [
    {
      name: 'id',
      value: id,
      type: TYPES.Int
    }
  ]
  const result = await sqlService.query(sql, params)
  return R.head(result)
}

module.exports = monitor('jobStatus.data-service', jobStatusDataService)
