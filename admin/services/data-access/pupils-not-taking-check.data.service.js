'use strict'

const sqlService = require('./sql.service')
const TYPES = require('tedious').TYPES
const monitor = require('../../helpers/monitor')

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
      ORDER BY p.lastName ASC, p.foreName ASC, p.middleNames ASC, p.dateOfBirth ASC`

    const params = [{
      name: 'dfeNumber',
      value: dfeNumber,
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

module.exports = monitor('pupilsNotTakingCheck.data-service', pupilsNotTakingCheckDataService)
