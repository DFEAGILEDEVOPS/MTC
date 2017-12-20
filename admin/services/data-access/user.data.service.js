'use strict'

const { TYPES } = require('tedious')
const R = require('ramda')
const sqlService = require('./sql.service')

const table = '[user]'

const userDataService = {

  /**
   * Find a User by the identifier
   * String -> {User} || undefined
   * @param identifier
   * @return {Promise<object>}
   */
  sqlFindOneByIdentifier: async function (identifier) {
    const paramIdentifier = { name: 'identifier', type: TYPES.NVarChar, value: identifier }
    const sql = `
      SELECT *    
      FROM ${table}
      WHERE identifier = @identifier
    `
    const rows = await sqlService.query(sql, [paramIdentifier])
    return R.head(rows)
  }
}

module.exports = userDataService
