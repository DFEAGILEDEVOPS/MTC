'use strict'

const { TYPES } = require('./sql.service')
const sqlService = require('./sql.service')

/**
 * @typedef {object} SchoolAuditSummary
 * @property {number} id
 * @property {moment.Moment} createdAt
 * @property {string} auditOperation
 * @property {string} user
 */

const service = {
  /**
   * returns a summary of all audited changes for a specified school
   * @param {string} urlSlug
   * @returns {Promise<Array<SchoolAuditSummary>>}
   */
  getSummary: async function getSummary (urlSlug) {
    const params = [{
      name: 'urlSlug',
      type: TYPES.UniqueIdentifier,
      value: urlSlug
    }]
    const sql = `
      SELECT sa.id, sa.createdAt, aot.auditOperation, COALESCE(u.displayName, u.identifier, 'system') as [user]
      FROM [mtc_admin].[schoolAudit] sa
      LEFT OUTER JOIN [mtc_admin].[user] u ON
        u.id = sa.operationBy_userId
      INNER JOIN [mtc_admin].[auditOperationTypeLookup] aot ON
        aot.id = sa.auditOperationTypeLookup_id
      INNER JOIN [mtc_admin].[school] s ON s.id = sa.school_id
      WHERE s.urlSlug=@urlSlug
      ORDER BY sa.id DESC`
    return sqlService.readonlyQuery(sql, params)
  },

  getAuditPayload: async function getAuditPayload (auditEntryId) {
    const params = [{
      name: 'auditEntryId',
      type: TYPES.Int,
      value: auditEntryId
    }]
    const sql = `
      SELECT sa.newData
      FROM [mtc_admin].[schoolAudit] sa
      WHERE sa.id=@auditEntryId
    `
    return sqlService.readonlyQuery(sql, params)
  },

  auditImpersonation: async function auditImpersonation (userId, schoolId) {
    throw new Error('Not implemented')
  }
}

module.exports = service
