'use strict'

const R = require('ramda')
const sqlService = require('./sql.service')
const { TYPES } = require('./sql.service')
const table = 'checkStatus'

/**
 * Find one by ID
 * @param {number} id
 */
module.exports.sqlFindOneById = async function sqlFindOneById (id) {
  return sqlService.findOneById(table, id)
}

/**
 * Find one by Code
 * @param code
 * @return {Promise<object>}
 */
module.exports.sqlFindOneByCode = async function sqlFindOneByCode (code) {
  const sql = `SELECT TOP 1 * from ${sqlService.adminSchema}.${table}
    WHERE code = @code`
  const param = { name: 'code', value: code, type: TYPES.Char }
  const res = await sqlService.query(sql, [param])
  return R.head(res)
}
