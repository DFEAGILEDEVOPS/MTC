'use strict'

const { TYPES } = require('./sql.service')
const sqlService = require('./sql.service')

/**
 * @typedef {object} CreateSchoolAuditEntry
 * @property {number} auditOperationTypeId
 * @property {object} newData
 * @property {number} schoolId
 * @property {number} userId
 */

/**
 * @typedef {object} SchoolAuditSummary
 * @property {moment.Moment} createdAt
 * @property {string} userIdentifier
 */

const service = {
  /**
   * returns a summary of all changes for a school, grouped by the internal transaction id
   * @param {number} schoolId
   * @returns {Promise<Array<SchoolAuditSummary>>}
   */
  getSummary: async function getSummary (schoolId) {
    const params = [{
      name: 'schoolId',
      type: TYPES.Int,
      value: schoolId
    }]
    const sql = `
      SELECT sa.createdAt, u.identifier as userIdentifier
      FROM [mtc_admin].[schoolAudit] sa
      INNER JOIN [mtc_admin].[user] u ON
        u.id = sa.operationBy_userId
      WHERE sa.school_id=@schoolId
      ORDER BY sa.id DESC`
    return sqlService.readonlyQuery(sql, params)
  },
  /**
   *
   * @param {CreateSchoolAuditEntry} auditEntry
   * @returns {Promise<any>}
   */
  createEntry: async function createEntry (auditEntry) {
    return sqlService.create('schoolAudit', auditEntry)
  }
}

module.exports = service
