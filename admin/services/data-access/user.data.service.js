'use strict'

const { TYPES } = require('./sql.service')
const R = require('ramda')
const sqlService = require('./sql.service')

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
      SELECT u.id, u.identifier, u.school_id, u.role_id, u.displayName, r.title as [roleTitle]
      FROM mtc_admin.[user] u
      INNER JOIN mtc_admin.role r ON u.role_id = r.id
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
        s.name as schoolName,
        sce.timezone
      FROM mtc_admin.[user] u
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
  /**
   * update a user record with a new school id
   * @param userId number
   * @param newSchoolId number
   * @returns a promise containing the update work
   */
  sqlUpdateSchool: async (userId, newSchoolId) => {
    return sqlService.update('[user]', { id: userId, school_id: newSchoolId })
  },
  /**
   * update a user record with a new role id
   * @param userId number
   * @param newRoleId number
   * @returns a promise containing the update work
   */
  sqlUpdateRole: async (userId, newRoleId) => {
    return sqlService.update('[user]', { id: userId, role_id: newRoleId })
  }
}

module.exports = userDataService
