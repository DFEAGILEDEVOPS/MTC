'use strict'

const sqlService = require('../../../lib/sql/sql.service')
const TYPES = sqlService.TYPES

const resultDataService = {
  /**
   * Provide the raw data for pupil scores (pupil details, scores, not attending info, and data for determining the results status)
   * @param {number} schoolId - school.id from database
   * @return {Promise<*>}
   */
  sqlFindPupilResultsForSchool: async function sqlFindPupilResultsForSchool (schoolId) {
    const sql = `SELECT
    p.id AS pupilId,
    p.foreName,
    p.middleNames,
    p.lastName,
    p.group_id,
    p.dateOfBirth,
    p.urlSlug,
    p.checkComplete,
    p.currentCheckId,
    p.restartAvailable,
    p.attendanceId,
    p.school_id,
    cs.mark,
    ac.code as attendanceCode,
    ac.reason as attendanceReason
  FROM mtc_admin.[pupil] p
  LEFT JOIN mtc_admin.checkScore cs ON (cs.checkId = p.currentCheckId)
  LEFT JOIN mtc_admin.attendanceCode ac ON (ac.id = p.attendanceId)
 WHERE p.school_id = @schoolId;`
    const params = [
      {
        name: 'schoolId',
        value: schoolId,
        type: TYPES.Int
      }
    ]
    return sqlService.query(sql, params)
  }
}

module.exports = resultDataService
