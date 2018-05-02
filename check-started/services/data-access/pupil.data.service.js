'use strict'

const { TYPES } = require('tedious')
const R = require('ramda')
const pupilDataService = {}
const table = '[pupil]'
const sqlService = require('./sql.service')

/** SQL METHODS */

/**
 * Find a pupil by Id
 * @param id
 * @return {Promise<void>}
 */
pupilDataService.sqlFindOneById = async (id) => {
  const param = { name: 'id', type: TYPES.Int, value: id }
  const sql = `
      SELECT TOP 1 
        *    
      FROM ${sqlService.adminSchema}.${table}
      WHERE id = @id    
    `
  const results = await sqlService.query(sql, [param])
  return R.head(results)
}

/**
 * Update am existing pupil object.  Must provide the `id` field
 * @param update
 * @return {Promise<*>}
 */
pupilDataService.sqlUpdate = async (update) => {
  return sqlService.update(table, update)
}

module.exports = pupilDataService
