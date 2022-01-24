'use strict'

const { TYPES } = require('./sql.service')
const sqlService = require('./sql.service')

/**
 * @typedef {object} SchoolAuditSummary
 * @property {moment.Moment} createdAt
 * @property {string} auditOperation
 * @property {string} user
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
      SELECT sa.createdAt, aot.auditOperation, ISNULL(u.identifier, 'system') as [user]
      FROM [mtc_admin].[schoolAudit] sa
      LEFT OUTER JOIN [mtc_admin].[user] u ON
        u.id = sa.operationBy_userId
      INNER JOIN [mtc_admin].[auditOperationTypeLookup] aot ON
        aot.id = sa.auditOperationTypeLookup_id
      WHERE sa.school_id=@schoolId
      ORDER BY sa.id DESC`
    return sqlService.readonlyQuery(sql, params)
  }
}

module.exports = service
