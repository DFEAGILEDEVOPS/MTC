'use strict'

const R = require('ramda')

const attendanceCodeDataService = require('./data-access/attendance-code.data.service')
const pupilAttendanceDataService = require('./data-access/pupil-attendance.data.service')
const pupilDataService = require('./data-access/pupil.data.service')
const pinService = require('./pin.service')
const monitor = require('../helpers/monitor')

const attendanceService = {
  /**
   * Update pupil attendance by slug url.
   * @param slugs
   * @param code
   * @param userId
   * @returns {Promise<void>}
   */
  updatePupilAttendanceBySlug: async (slugs, code, userId, schoolId) => {
    const pupils = await pupilDataService.sqlFindPupilsByUrlSlug(slugs, schoolId)
    if (!Array.isArray(pupils) || pupils.length === 0) {
      throw new Error('Pupils not found')
    }
    const attendanceCode = await attendanceCodeDataService.sqlFindOneAttendanceCodeByCode(code)
    if (!attendanceCode) {
      throw new Error(`attendanceCode not found: ${code}`)
    }

    // We need to determine if this is an update or an insert, the db doesn't support
    // UPSERT so we need to do it manually.
    const ids = pupils.map(p => { return p.id })
    const pupilAttendance = await pupilAttendanceDataService.findByPupilIds(ids)

    const updates = pupilAttendance.map(pa => { return pa.pupil_id })
    const inserts = R.difference(ids, updates)

    if (updates && updates.length) {
      await pupilAttendanceDataService.sqlUpdateBatch(updates, attendanceCode.id, userId)
    }
    if (inserts && inserts.length) {
      await pupilAttendanceDataService.sqlInsertBatch(inserts, attendanceCode.id, userId)
    }

    await pinService.expireMultiplePins(ids, schoolId)
  },

  /**
   * Delete a pupil attendance code
   * @param pupilSlug
   * @param dfeNumber
   * @return {Promise<*>}
   */
  unsetAttendanceCode: async (pupilSlug, dfeNumber) => {
    const pupil = await pupilDataService.sqlFindOneBySlugAndSchool(pupilSlug, dfeNumber)
    if (!pupil) {
      throw new Error(`Pupil with id ${pupilSlug} and school ${dfeNumber} not found`)
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
   * @return {boolean}
   */
  hasAttendance: async (pupilId, pinEnv) => {
    const pupilAttendance = await pupilAttendanceDataService.findOneByPupilId(pupilId)
    return pinEnv === 'live'
      ? pupilAttendance !== undefined && pupilAttendance.id !== undefined
      : pupilAttendance !== undefined && pupilAttendance.code === 'LEFTT' // left school
  }
}

module.exports = monitor('attendance.service', attendanceService)
