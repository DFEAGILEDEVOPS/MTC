'use strict'

const sqlService = require('./sql.service')
const { TYPES } = require('./sql.service')

const pupilsNotTakingCheckDataService = {
/**
 * @param {number} schoolId
 * @description returns all pupils with specified school that have a record of attendance
 * @returns {Promise.<*>}
 */
  sqlFindPupilsWithReasons: async (schoolId) => {
    const sql = `
      SELECT p.*, ac.reason
      FROM [mtc_admin].[pupil] p
        INNER JOIN [mtc_admin].[pupilAttendance] pa ON p.id = pa.pupil_id
        INNER JOIN [mtc_admin].[attendanceCode] ac ON pa.attendanceCode_id = ac.id
      WHERE p.school_id = @schoolId AND pa.isDeleted = 0
      ORDER BY p.lastName ASC, p.foreName ASC, p.middleNames ASC, p.dateOfBirth ASC
    `

    const params = [{
      name: 'schoolId',
      value: schoolId,
      type: TYPES.Int
    }]

    return sqlService.query(sql, params)
  },

  /**
   * @param {number} schoolId
   * @description returns all pupils with specified school that don't have a record of attendance
   * @returns {Promise.<*>}
   */
  sqlFindPupilsWithoutReasons: async (schoolId) => {
    const sql = `
    SELECT
    p.foreName,
    p.middleNames,
    p.lastName,
    p.dateOfBirth,
    p.urlSlug,
    p.group_id
  FROM [mtc_admin].[pupil] p
  WHERE p.school_id = @schoolId
    AND p.currentCheckId IS NULL
    AND p.attendanceId IS NULL
  ORDER BY p.lastName ASC, p.foreName ASC, p.middleNames ASC, p.dateOfBirth ASC
    `
    const params = [{
      name: 'schoolId',
      value: schoolId,
      type: TYPES.Int
    }]

    return sqlService.query(sql, params)
  }
}

module.exports = pupilsNotTakingCheckDataService
