'use strict'

const sqlService = require('./sql.service')
const table = '[role]'

const roleDataService = {
  /**
   * Find a School by the id
   * number -> {School} || undefined
   * @param {number} id
   * @return {Promise<object>} School
   */
  sqlFindOneById: async function (id) {
    return sqlService.findOneById(table, id)
  }
}

module.exports = roleDataService
