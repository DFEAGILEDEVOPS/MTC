'use strict'

const sqlService = require('./sql.service')
const { TYPES } = require('./sql.service')

const pupilsNotTakingCheckDataService = {
/**
 * @param {number} schoolId
 * @description returns all pupils with specified school that have a record of attendance
 * @returns {Promise.<*>}
 */
  sqlFindPupilsWithReasons: async (schoolId, role) => {
    const sql = `
      SELECT
        p.*,
        ac.reason,
        (SELECT
          CASE
            WHEN count(*) > 0 THEN CAST(0 AS BIT) ELSE CAST(1 AS BIT)
          END
        FROM
          [mtc_admin].[vewAttendanceCodePermissions] WHERE roleTitle = @role
        AND
          attendanceCode = ac.code
        ) as attendanceCodeIsPrivileged

      FROM [mtc_admin].[pupil] p
        INNER JOIN [mtc_admin].[pupilAttendance] pa ON p.id = pa.pupil_id
        INNER JOIN [mtc_admin].[attendanceCode] ac ON pa.attendanceCode_id = ac.id
      WHERE p.school_id = @schoolId AND pa.isDeleted = 0
    `

    const params = [
      { name: 'schoolId', value: schoolId, type: TYPES.Int },
      { name: 'role', value: role, type: TYPES.NVarChar }
    ]

    return sqlService.query(sql, params)
  },

  /**
   * @param {number} schoolId
   * @description returns all pupils with specified school that don't have a record of attendance
   * @returns {Promise.<*>}
   */
  sqlFindPupilsWithoutReasons: async (schoolId) => {
    if (schoolId === undefined || schoolId === null) {
      throw new Error('schoolId must be provided')
    }
    const sql = `
        SELECT p.foreName, p.middleNames, p.lastName, p.dateOfBirth, p.urlSlug, p.group_id
          FROM [mtc_admin].[pupil] p
               LEFT JOIN [mtc_admin].[check] c ON (p.currentCheckId = c.id)
               LEFT JOIN [mtc_admin].[checkPin] cp ON (cp.check_id = c.id)
         WHERE p.school_id = @schoolId
          AND p.frozen = 0
           AND (
             -- No check has been generated for the pupil
                 p.currentCheckId IS NULL OR
                 -- a check has been generated, but was never logged in and has now expired
                 (c.pupilLoginDate IS NULL
                      -- and has expired or been deleted (happens on a schedule after expiry)
                      AND (cp.check_id IS NULL OR SYSDATETIMEOFFSET() > cp.pinExpiresAt)))
           AND p.attendanceId IS NULL
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
  sqlFindPupilsWithoutReasonsInAdminPeriod: async (schoolId) => {
    const sql = `
      SELECT
        p.foreName,
        p.middleNames,
        p.lastName,
        p.dateOfBirth,
        p.urlSlug,
        p.group_id
      FROM
        [mtc_admin].[pupil] p
      WHERE
        p.school_id = @schoolId
      AND
        p.attendanceId IS NULL
      AND
        p.checkComplete = 0
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
