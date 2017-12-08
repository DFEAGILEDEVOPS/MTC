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
  return Pupil
    .find({'attendanceCode': {$exists: true}, 'school': schoolId})
    .sort('lastName')
    .lean()
    .exec()
}

pupilsNotTakingCheckDataService.getAttendanceCodes = async () => {
  return AttendanceCode
    .find()
    .sort('order')
    .lean()
    .exec()
}

module.exports = pupilsNotTakingCheckDataService
