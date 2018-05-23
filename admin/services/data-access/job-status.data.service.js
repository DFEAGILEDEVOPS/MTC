'use strict'

const R = require('ramda')
const sqlService = require('./sql.service')
const TYPES = require('tedious').TYPES

const jobStatusDataService = {}
const table = '[jobStatus]'

/**
 * Find active pupil census record.
 * @return {Object}
 */
jobStatusDataService.sqlFindOneByCode = async (code) => {
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

module.exports = jobStatusDataService
