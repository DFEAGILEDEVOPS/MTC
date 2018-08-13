'use strict'

const sqlService = require('./sql.service')
const TYPES = require('tedious').TYPES
const R = require('ramda')
const monitor = require('../../helpers/monitor')

const table = '[role]'

const roleDataService = {
  /**
   * Find a Role by the id
   * number -> {School} || undefined
   * @param {number} id
   * @return {Promise<object>} School
   */
  sqlFindOneById: async (id) => {
    return sqlService.findOneById(table, id)
  },
  sqlFindOneByTitle: async (roleTitle) => {
    const params = [
      {
        name: 'roleTitle',
        value: roleTitle,
        type: TYPES.NVarChar
      }
    ]
    const result = await sqlService.query(`SELECT TOP 1 [id], [title] FROM ${sqlService.adminSchema}.${table} WHERE title=@roleTitle`, params)
    return R.head(result)
  }
}

module.exports = monitor('role.data-service', roleDataService)
