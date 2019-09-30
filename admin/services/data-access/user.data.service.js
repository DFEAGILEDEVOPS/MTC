'use strict'

const { TYPES } = require('./sql.service')
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
   * Find a User information including role and school by the identifier
   * String -> {User} || undefined
   * @param identifier
   * @return {Promise<object>}
   */
  sqlFindUserInfoByIdentifier: async (identifier) => {
    const paramIdentifier = { name: 'identifier', type: TYPES.NVarChar, value: identifier }
    const sql = `
      SELECT
        u.id,
        u.passwordHash,
        u.identifier,
        r.title AS roleName,
        u.school_id AS schoolId,
        s.dfeNumber,
        sce.timezone AS timezone
      FROM mtc_admin.${table} u
      INNER JOIN mtc_admin.[role] r
        ON u.role_id = r.id
      LEFT JOIN mtc_admin.school s
        ON u.school_id = s.id
      LEFT JOIN mtc_admin.sce
        ON s.id = sce.school_id
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
