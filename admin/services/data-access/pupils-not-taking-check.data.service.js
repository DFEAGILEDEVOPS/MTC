'use strict'

const Pupil = require('../../models/pupil')
const AttendanceCode = require('../../models/attendance-code')
const pupilsNotTakingCheckDataService = {}

/**
 *
 * @param schoolId
 * @returns {Promise.<*>}
 */
pupilsNotTakingCheckDataService.fetchPupilsWithReasons = async (schoolId) => {
  let pupilsWithReasons
  pupilsWithReasons = await Pupil
    .find({'attendanceCode': {$exists: true}, 'school': schoolId})
    .sort('lastName')
  return pupilsWithReasons
}

pupilsNotTakingCheckDataService.getAttendanceCodes = async () => {
  let attendanceCodes
  attendanceCodes = await AttendanceCode
    .find()
    .sort('order')
  return attendanceCodes
}

module.exports = pupilsNotTakingCheckDataService
