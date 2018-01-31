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
  sqlFindOneByIdentifier: async (identifier) => {
    const paramIdentifier = { name: 'identifier', type: TYPES.NVarChar, value: identifier }
    const sql = `
      SELECT *    
      FROM ${table}
      WHERE identifier = @identifier
    `
    const rows = await sqlService.query(sql, [paramIdentifier])
    return R.head(rows)
  },
  /**
   * Insert a user record and return the userId
   * @param user object
   * @returns the id of the newly inserted user record
   */
  sqlCreate: async (user) => {
    return sqlService.create('[user]', user)
  },
  sqlUpdateSchool: async (userId, newSchoolId) => {
    return sqlService.update('[user]', { id: userId, school_id: newSchoolId })
  }
}

module.exports = userDataService
