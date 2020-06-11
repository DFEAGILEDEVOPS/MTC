'use strict'

const attendanceCodeDataService = require('./data-access/attendance-code.data.service')
const pupilAttendanceDataService = require('./data-access/pupil-attendance.data.service')
const pupilDataService = require('./data-access/pupil.data.service')

const attendanceService = {
  /**
   * Set pupils to be non-attending
   * @param slugs - pupil slugs
   * @param code - attendance code
   * @param userId - user.id of user performing the action
   * @returns {Promise<void>}
   */
  updatePupilAttendanceBySlug: async (slugs, code, userId, schoolId) => {
    return pupilAttendanceDataService.markAsNotAttending(slugs, code, userId, schoolId)
  },

  /**
   * Delete a pupil attendance code
   * @param pupilSlug
   * @param schoolId
   * @return {Promise<*>}
   */
  unsetAttendanceCode: async (pupilSlug, schoolId) => {
    const pupil = await pupilDataService.sqlFindOneBySlugAndSchool(pupilSlug, schoolId)
    if (!pupil) {
      throw new Error(`Pupil with id ${pupilSlug} and school ${schoolId} not found`)
    }
    return pupilAttendanceDataService.sqlDeleteOneByPupilId(pupil.id)
  },

  /**
   * Get attendance codes.
   * @returns {Promise<*>}
   */
  getAttendanceCodes: async () => {
    return attendanceCodeDataService.sqlFindAttendanceCodes()
  },

  /**
   * Check if pupil has an existing attendance entry for the
   * specific `pinEnv` environment.
   *
   * All attendance entries are considered for live checks, while for
   * familiarisation checks, only `left school` entries are considered
   *
   * @param pupilId
   * @param pinEnv
   * @return {Promise<boolean>}
   */
  hasAttendance: async (pupilId, pinEnv) => {
    const pupilAttendance = await pupilAttendanceDataService.findOneByPupilId(pupilId)
    return pinEnv === 'live'
      ? pupilAttendance !== undefined && pupilAttendance.id !== undefined
      : pupilAttendance !== undefined && pupilAttendance.code === 'LEFTT' // left school
  }
}

module.exports = attendanceService
