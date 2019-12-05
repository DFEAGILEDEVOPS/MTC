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
    // const pupils = await pupilDataService.sqlFindPupilsByUrlSlug(slugs, schoolId)
    // if (!Array.isArray(pupils) || pupils.length === 0) {
    //   throw new Error('Pupils not found')
    // }
    // const attendanceCode = await attendanceCodeDataService.sqlFindOneAttendanceCodeByCode(code)
    // if (!attendanceCode) {
    //   throw new Error(`attendanceCode not found: ${code}`)
    // }
    //
    // const pupilIds = pupils.map(p => { return p.id })
    //
    // // Pupils with a Restart (unconsumed) are allowed to transition to NOT ATTENDING,
    // // so we must delete any unconsumed restarts for the pupils.
    // try {
    //   await attendanceCodeDataService.sqlDeleteUnconsumedRestarts(pupilIds, userId)
    // } catch (error) {
    //   logger.error('Failed to delete unconsumed restarts', error)
    //   throw error
    // }
    //
    // // We need to determine if this is an update or an insert, the db doesn't support
    // // UPSERT so we need to do it manually.
    // const pupilAttendance = await pupilAttendanceDataService.findByPupilIds(pupilIds)
    //
    // const updates = pupilAttendance.map(pa => { return pa.pupil_id })
    // const inserts = R.difference(pupilIds, updates)
    //
    // if (updates && updates.length) {
    //   await pupilAttendanceDataService.sqlUpdateBatch(updates, attendanceCode.id, userId)
    // }
    //
    // if (inserts && inserts.length) {
    //   await pupilAttendanceDataService.sqlInsertBatch(inserts, attendanceCode.id, userId)
    // }
    //
    // // TODO: update this method to handle pin expiry in the same way that `restartTransactionForPupils` does
    // // and then remove `expireMultiplePupils`
    // await pinService.expireMultiplePins(pupilIds, schoolId)

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
   * @return {boolean}
   */
  hasAttendance: async (pupilId, pinEnv) => {
    const pupilAttendance = await pupilAttendanceDataService.findOneByPupilId(pupilId)
    return pinEnv === 'live'
      ? pupilAttendance !== undefined && pupilAttendance.id !== undefined
      : pupilAttendance !== undefined && pupilAttendance.code === 'LEFTT' // left school
  }
}

module.exports = attendanceService
