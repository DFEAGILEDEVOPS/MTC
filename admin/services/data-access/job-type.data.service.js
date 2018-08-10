'use strict'

const R = require('ramda')
const sqlService = require('./sql.service')
const monitor = require('../../helpers/monitor')
const TYPES = require('tedious').TYPES

const jobTypeDataService = {}
const table = '[jobType]'

/**
 * Find job type by type code.
 * @return {Object}
 */
jobTypeDataService.sqlFindOneByTypeCode = async (jobTypeCode) => {
  const sql = `SELECT * 
  FROM ${sqlService.adminSchema}.${table}
  WHERE jobTypeCode=@jobTypeCode`
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

module.exports = monitor('jobType.data-service', jobTypeDataService)
