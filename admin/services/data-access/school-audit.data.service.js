'use strict'

const { TYPES } = require('./sql.service')
const sqlService = require('./sql.service')

/**
 * @typedef {object} SchoolAuditRecord
 * @property {moment.Moment} createdAt
 * @property {moment.Moment} updatedAt
 * @property {number} leaCode
 * @property {number} estabCode
 * @property {string} name
 * @property {string} pin
 * @property {moment.Moment} pinExpiresAt
 * @property {string} urlSlug
 * @property {number} urn
 * @property {number} dfeNumber
 * @property {number} lastModifiedBy_userId
 */

/**
 * @typedef {object} SchoolAuditSummary
 * @property {moment.Moment} updatedAt
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
      SELECT updatedAt
      FROM cdc.mtc_admin_school_CT
      WHERE id=@schoolId
      GROUP BY __$start_lsn, updatedAt`
    return sqlService.readonlyQuery(sql, params)
  }
}

module.exports = service
