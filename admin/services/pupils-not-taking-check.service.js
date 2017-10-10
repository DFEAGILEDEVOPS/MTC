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
  /**
   * Fetch pupils with reasons to not take the test.
   * @param schoolId
   * @returns {Promise.<*>}
   */
  fetchPupilsWithReasons: async (schoolId) => {
    const pupilsWithReasons = await Pupil
    .find({'attendanceCode': {$exists: true}, 'school': schoolId})
    .sort('lastName')
    if (pupilsWithReasons.length > 0) {
      return pupilsWithReasons
    }
  },
  /**
   * Sort columns by last name asc/desc.
   * @param sortField
   * @param sortDirection
   * @returns {Promise.<{htmlSortDirection: Array, arrowSortDirection: Array}>}
   */
  sortPupilsByLastName: async (sortField, sortDirection) => {
    let htmlSortDirection = []
    let arrowSortDirection = []
    let sortingDirection = [
      {
        'key': 'name',
        'value': 'asc'
      },
      {
        'key': 'reason',
        'value': 'asc'
      }
    ]
    // Markup links and arrows
    sortingDirection.map((sd, index) => {
      if (sd.key === sortField) {
        htmlSortDirection[sd.key] = (sortDirection === 'asc' ? 'desc' : 'asc')
        arrowSortDirection[sd.key] = (htmlSortDirection[sd.key] === 'asc' ? 'sort up' : 'sort')
      } else {
        htmlSortDirection[sd.key] = 'asc'
        arrowSortDirection[sd.key] = 'sort'
      }
    })
    return {
      htmlSortDirection,
      arrowSortDirection
    }
  },
  /**
   * Sort columns by reason asc/desc.
   * @param pupilsList
   * @param sortDirection
   * @returns {*}
   */
  sortPupilsByReason: (pupilsList, sortDirection) => {
    let sortedPupilsList
    sortedPupilsList = pupilsList.sort((a, b) => {
      if (a.reason === 'N/A') {
        return 1
      } else if (b.reason === 'N/A') {
        return -1
      } else if (a.reason === b.reason) {
        return 0
      } else if (sortDirection === 'asc') {
        return a.reason < b.reason ? -1 : 1
      } else {
        return a.reason < b.reason ? 1 : -1
      }
    })
    return sortedPupilsList
  },
  /**
   * Fetch list of pupils that have reasons.
   * @param attendanceCodes
   * @param pupils
   * @returns {Promise.<Promise.<T>|Promise|Promise<any>|*>}
   */
  formatPupilsWithReasons: (attendanceCodes, pupils) => {
    return Promise.all(pupils.map(async (p) => {
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
  }
}

module.exports = pupilsNotTakingCheckService
