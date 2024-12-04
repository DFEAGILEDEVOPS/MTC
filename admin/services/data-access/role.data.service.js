'use strict'

const sqlService = require('./sql.service')
const { TYPES } = require('./sql.service')
const R = require('ramda')

const table = '[role]'

/**
 * @typedef UserRole
 * @property {number} id
 * @property {string} title
 */

const roleDataService = {
  /**
   * Find a Role by the id
   * number -> {School} || undefined
   * @param {number} id
   * @return {Promise<UserRole>} School
   */
  sqlFindOneById: async (id) => {
    return sqlService.findOneById(table, id)
  },
  /**
   * @returns {Promise<UserRole>}
   */
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

module.exports = roleDataService
