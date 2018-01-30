'use strict'

const sqlService = require('./sql.service')
const TYPES = require('tedious').TYPES
const R = require('ramda')

const table = '[role]'

const roleDataService = {
  /**
   * Find a School by the id
   * number -> {School} || undefined
   * @param {number} id
   * @return {Promise<object>} School
   */
  sqlFindOneById: async (id) => {
    return sqlService.findOneById(table, id)
  },
  sqlFindOneByName: async (roleName) => {
    const params = [
      {
        name: 'roleName',
        value: roleName,
        type: TYPES.NVarChar
      }
    ]
    const result = sqlService.query(`SELECT TOP 1 [id], [name] FROM ${sqlService.adminSchema}.${table} WHERE Name=@roleName`, params)
    return R.head(result)
  }
}

module.exports = roleDataService
