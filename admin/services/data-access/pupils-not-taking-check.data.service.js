'use strict'

const Pupil = require('../../models/pupil')
const AttendanceCode = require('../../models/attendance-code')
const sqlService = require('./sql.service')
const TYPES = require('tedious').TYPES

const pupilsNotTakingCheckDataService = {
/**
 * @param schoolId
 * @deprecated use sqlFindPupilsWithReasons
 * @returns {Promise.<*>}
 */
  fetchPupilsWithReasons: async (schoolId) => {
    return Pupil
      .find({'attendanceCode': {$exists: true}, 'school': schoolId})
      .sort('lastName')
      .lean()
      .exec()
  },

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
      WHERE s.dfeNumber = @dfeNumber
      ORDER BY p.lastName ASC`

    const params = [{
      name: 'dfeNumber',
      value: dfeNumber,
      type: TYPES.Int
    }]

    return sqlService.query(sql, params)
  },
 /**
 *
 * @deprecated use attendanceCodeDataService.sqlFindAttendanceCodes
 * @returns {Promise.<*>}
 */
  getAttendanceCodes: async () => {
    return AttendanceCode
      .find()
      .sort('order')
      .lean()
      .exec()
  }
}

module.exports = pupilsNotTakingCheckDataService
