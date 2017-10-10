//const School = require('../models/school')
const Pupil = require('../models/pupil')
const AttendanceCode = require('../models/attendance-code')

/** @namespace */

const pupilsNotTakingCheckService = {

  /**
   * Fetch attendance codes from database.
   * @returns {Promise.<*>}
   */
  fetchAttendanceCodes: async () => {
    let attendanceCodes
    try {
      attendanceCodes = await AttendanceCode.getAttendanceCodes().exec()
    } catch (error) {
      throw new Error(error)
    }
    return attendanceCodes
  },
  fetchListPupilsWithReasons: async (attendanceCodes, pupils) => {
    const pupilsList = Promise.all(pupils.map(async (p) => {
      p.id = null
      p.reason = 'N/A'
      if (p.attendanceCode !== undefined && p.attendanceCode._id !== undefined) {
        let accCode = attendanceCodes.filter(ac => JSON.stringify(ac._id) === JSON.stringify(p.attendanceCode._id))
        p.reason = accCode[0].reason
      }
      return p
    })).catch((error) => {
      throw new Error(error)
    })
    return pupilsList
  }
}

module.exports = pupilsNotTakingCheckService
