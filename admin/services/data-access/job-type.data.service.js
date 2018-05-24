'use strict'

const R = require('ramda')
const sqlService = require('./sql.service')
const TYPES = require('tedious').TYPES

const jobTypeDataService = {}
const table = '[jobType]'

/**
 * Find job type by type code.
 * @return {Object}
 */
jobTypeDataService.sqlFindOneByTypeCode = async (code) => {
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

module.exports = jobTypeDataService
