'use strict'

const sqlService = require('./sql.service')
const { TYPES } = require('./sql.service')

const pupilsNotTakingCheckDataService = {
/**
 * @param {number} dfeNumber
 * @description returns all pupils with specified school that have a record of attendance
 * @returns {Promise.<*>}
 */
  sqlFindPupilsWithReasons: async (dfeNumber) => {
    const sql = `
      SELECT p.*, ac.reason
      FROM ${sqlService.adminSchema}.[pupil] p 
        INNER JOIN ${sqlService.adminSchema}.[school] s ON p.school_id = s.id
        INNER JOIN ${sqlService.adminSchema}.[pupilAttendance] pa ON p.id = pa.pupil_id 
        INNER JOIN ${sqlService.adminSchema}.[attendanceCode] ac ON pa.attendanceCode_id = ac.id
      WHERE s.dfeNumber = @dfeNumber AND pa.isDeleted = 0
      ORDER BY p.lastName ASC, p.foreName ASC, p.middleNames ASC, p.dateOfBirth ASC
    `

    const params = [{
      name: 'dfeNumber',
      value: dfeNumber,
      type: TYPES.Int
    }]

    return sqlService.query(sql, params)
  },

  /**
   * @param {number} schoolId
   * @description returns all pupils with specified school that don't have a
   * record of attendance and haven't completed a check
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
        pg.group_id
      FROM ${sqlService.adminSchema}.[pupil] p 
      LEFT JOIN ${sqlService.adminSchema}.[pupilAttendance] pa ON p.id = pa.pupil_id AND pa.isDeleted=0
      LEFT JOIN ${sqlService.adminSchema}.[pupilGroup] pg ON p.id = pg.pupil_id
      LEFT JOIN ${sqlService.adminSchema}.[check] c ON p.id = c.pupil_id AND c.isLiveCheck=1
      LEFT JOIN ${sqlService.adminSchema}.[checkStatus] cs ON cs.id = c.checkStatus_id
      LEFT JOIN ${sqlService.adminSchema}.[pupilRestart] pr ON pr.pupil_id = p.id AND pr.isDeleted=0 AND pr.check_id IS NULL
      WHERE
        p.school_id = @schoolId
        AND pa.id IS NULL
        AND (cs.code IS NULL OR pr.id IS NOT NULL)
      GROUP BY
        p.foreName,
        p.middleNames,
        p.lastName,
        p.dateOfBirth,
        p.urlSlug,
        pg.group_id
      ORDER BY
        p.lastName ASC,
        p.foreName ASC,
        p.middleNames ASC,
        p.dateOfBirth ASC
    `
    const params = [{
      name: 'schoolId',
      value: schoolId,
      type: TYPES.Int
    }]

    return sqlService.query(sql, params)
  },

  /**
   * @param {Array} pupilIds
   * @description returns all pupils that are included in the list and have a record of attendance
   * @returns {Promise.<*>}
   */
  sqlFindPupilsWithReasonByIds: async (pupilIds) => {
    const select = `
      SELECT p.id, ac.reason
      FROM ${sqlService.adminSchema}.[pupil] p 
        INNER JOIN ${sqlService.adminSchema}.[pupilAttendance] pa ON p.id = pa.pupil_id 
        INNER JOIN ${sqlService.adminSchema}.[attendanceCode] ac ON pa.attendanceCode_id = ac.id
      `

    const where = sqlService.buildParameterList(pupilIds, TYPES.Int)
    const sql = [select, 'WHERE pa.isDeleted = 0 AND p.id IN (', where.paramIdentifiers.join(', '), ')'].join(' ')
    return sqlService.query(sql, where.params)
  }
}

module.exports = pupilsNotTakingCheckDataService
