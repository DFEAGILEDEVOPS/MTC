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
 * @param schoolId
 * @description returns all pupils with specified school that have a record of attendance
 * @returns {Promise.<*>}
 */
  sqlFindPupilsWithReasons: async (schoolId) => {
    const sql = `SELECT DISTINCT p.* FROM ${sqlService.adminSchema}.[pupil] p 
    INNER JOIN ${sqlService.adminSchema}.[pupilAttendance] pa
    ON p.id = pa.pupil_id WHERE p.school_id = @schoolId`
    const params = [{
      name: 'schoolId',
      value: schoolId,
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
