'use strict'

const R = require('ramda')
const sqlService = require('./sql.service')
const TYPES = require('tedious').TYPES

const jobStatusDataService = {}
const table = '[jobStatus]'

/**
 * Find job status by type code.
 * @return {Object}
 */
jobStatusDataService.sqlFindOneByTypeCode = async (code) => {
  const sql = `SELECT * 
  FROM ${sqlService.adminSchema}.${table}
  WHERE code=@code`
  const params = [
    {
      name: 'code',
      value: code,
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

module.exports = jobStatusDataService
