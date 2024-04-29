'use strict'

const attendanceCodeDataService = require('./data-access/attendance-code.data.service')
const pupilAttendanceDataService = require('./data-access/pupil-attendance.data.service')
const pupilDataService = require('./data-access/pupil.data.service')
const redisCacheService = require('./data-access/redis-cache.service')
const redisKeyService = require('./redis-key.service')
const { PupilFrozenService } = require('./pupil-frozen/pupil-frozen.service')
const { isNumber } = require('ramda-adjunct')

const attendanceService = {
  /**
   * Set pupils to be non-attending
   * @param slugs - pupil slugs
   * @param code - attendance code
   * @param userId - user.id of user performing the action
   * @param role - TEACHER, HELPDESK etc
   * @returns {Promise<void>}
   */
  updatePupilAttendanceBySlug: async (slugs, code, userId, pupilSchoolId, role) => {
    await PupilFrozenService.throwIfFrozenByUrlSlugs(slugs)
    await pupilAttendanceDataService.markAsNotAttending(slugs, code, userId, pupilSchoolId, role)
    // Drop the now invalid cache for the school results if it exists
    await redisCacheService.drop(redisKeyService.getSchoolResultsKey(pupilSchoolId))
  },

  /**
   * Delete a pupil attendance code
   * @param {string} pupilSlug
   * @param {number} schoolId
   * @param {number} userId
   * @param {string} role e.g. TEACHER
   * @return {Promise<*>}
   */
  unsetAttendanceCode: async (pupilSlug, schoolId, userId, role) => {
    if (pupilSlug === undefined) throw new Error('pupilSlug is not defined')
    if (!isNumber(schoolId)) throw new Error('schoolId is not a number')
    if (!isNumber(userId)) throw new Error('userId is not a number')
    if (!role) throw new Error('role is not defined')
    await PupilFrozenService.throwIfFrozenByUrlSlugs([pupilSlug])
    const pupil = await pupilDataService.sqlFindOneBySlugAndSchool(pupilSlug, schoolId)
    if (!pupil) {
      throw new Error(`Pupil with id ${pupilSlug} and school ${schoolId} not found`)
    }
    await pupilAttendanceDataService.sqlDeleteOneByPupilId(pupil.id, userId, role)
    // Drop the now invalid cache for the school results if it exists
    await redisCacheService.drop(redisKeyService.getSchoolResultsKey(schoolId))
  },

  /**
   * Get attendance codes.
   * @returns {Promise<*>}
   */
  getAttendanceCodes: async (role) => {
    const codes = await attendanceCodeDataService.sqlFindAttendanceCodes(role)
    if (Array.isArray(codes) && codes.length > 0) {
      const sorted = codes.sort((a, b) => {
        return a.order - b.order
      })
      return sorted
    }
    return codes
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
