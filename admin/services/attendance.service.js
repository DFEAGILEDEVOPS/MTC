'use strict'

const R = require('ramda')

const attendanceCodeDataService = require('./data-access/attendance-code.data.service')
const pupilAttendanceDataService = require('./data-access/pupil-attendance.data.service')
const pupilDataService = require('./data-access/pupil.data.service')
const pinService = require('./pin.service')

const attendanceService = {}

attendanceService.updatePupilAttendanceBySlug = async (slugs, code, userId) => {
  const pupils = await pupilDataService.sqlFindPupilsByUrlSlug(slugs)
  if (!pupils) {
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

  await pinService.expireMultiplePins(ids)
}

/**
 * Delete a pupil attendance code
 * @param pupilSlug
 * @param dfeNumber
 * @return {Promise<*>}
 */
attendanceService.unsetAttendanceCode = async (pupilSlug, dfeNumber) => {
  const pupil = await pupilDataService.sqlFindOneBySlugAndSchool(pupilSlug, dfeNumber)
  if (!pupil) {
    throw new Error(`Pupil with id ${pupilSlug} and school ${dfeNumber} not found`)
  }
  return pupilAttendanceDataService.sqlDeleteOneByPupilId(pupil.id)
}

module.exports = attendanceService
