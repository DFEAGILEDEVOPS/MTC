'use strict'

const moment = require('moment-timezone')

const config = require('../config')
const schoolDataService = require('../services/data-access/school.data.service')
const checkWindowV2Service = require('../services/check-window-v2.service')
const pupilDataService = require('../services/data-access/pupil.data.service')
const attendanceCodeDataService = require('./data-access/attendance-code.data.service')
const pupilAttendanceDataService = require('../services/data-access/pupil-attendance.data.service')
const headteacherDeclarationDataService = require('./data-access/headteacher-declaration.data.service')
const headteacherDeclarationService = {}

/**
 * Find the pupils for the given dfe number
 * @param schoolId
 * @return {Promise<object>}
 */
headteacherDeclarationService.findPupilsForSchool = async (schoolId) => {
  if (!schoolId) {
    throw new Error('schoolId is required')
  }
  return headteacherDeclarationDataService.sqlFindPupilsWithStatusAndAttendanceReasons(schoolId)
}

/**
 * Find the a pupil for the given pupilId and dfeNumber
 * @param pupilId
 * @param dfeNumber
 * @return {Promise<object>}
 */
headteacherDeclarationService.findPupilBySlugAndDfeNumber = async (urlSlug, dfeNumber) => {
  if (!dfeNumber || !urlSlug) {
    throw new Error('urlSlug and dfeNumber are required')
  }
  const school = await schoolDataService.sqlFindOneByDfeNumber(dfeNumber)
  if (!school) {
    throw new Error(`School [${dfeNumber}] not found`)
  }
  return pupilDataService.sqlFindOneWithAttendanceReasonsBySlugAndSchool(urlSlug, school.id)
}

/**
 * Fetch pupils and return eligibility to generate HDF
 * @param schoolId
 * @param checkEndDate
 * @param timezone
 * @returns {Array}
 */
headteacherDeclarationService.getEligibilityForSchool = async (schoolId, checkEndDate, timezone) => {
  if (!checkEndDate) {
    throw new Error('Check end date missing or not found')
  }
  const currentDate = moment.tz(timezone || config.DEFAULT_TIMEZONE)
  const ineligiblePupilsCount = currentDate.isBefore(checkEndDate)
    ? await headteacherDeclarationDataService.sqlFindPupilsBlockingHdfBeforeCheckEndDate(schoolId)
    : await headteacherDeclarationDataService.sqlFindPupilsBlockingHdfAfterCheckEndDate(schoolId)
  return ineligiblePupilsCount === 0
}

/**
 * Declare the results of the check, to be used by the Headteacher or equivalent role
 * This is the personal sign-off from the head, and closes the check for their school.
 * @param {object} form
 * @param {number} dfeNumber
 * @param {number} userId
 * @param {number} schoolId
 * @param {object} checkEndDate
 * @param {string} timezone
 * @return {Promise<void>}
 */
headteacherDeclarationService.submitDeclaration = async (form, dfeNumber, userId, schoolId, checkEndDate, timezone) => {
  const school = await schoolDataService.sqlFindOneByDfeNumber(dfeNumber)

  if (!school) {
    throw new Error(`school ${dfeNumber} not found`)
  }

  let hdfEligibility = await headteacherDeclarationService.getEligibilityForSchool(schoolId, checkEndDate, timezone)
  if (!hdfEligibility) {
    throw new Error('Not eligible to submit declaration')
  }

  let checkWindow = await checkWindowV2Service.getActiveCheckWindow()
  if (!checkWindow || !checkWindow.id) {
    throw new Error(`Active check window not found`)
  }
  const data = {
    signedDate: new Date(),
    checkWindow_id: checkWindow.id,
    school_id: school.id,
    user_id: userId,
    confirmed: form.confirm === 'Y',
    headTeacher: form.isHeadteacher === 'Y',
    jobTitle: form.jobTitle,
    fullName: [form.firstName, form.lastName].join(' ')
  }

  return headteacherDeclarationDataService.sqlCreate(data)
}

/**
 * Return the last HDF submitted for a school, using DfeNumber
 * @param {number} dfeNumber
 * @return {Promise<any>}
 */
headteacherDeclarationService.findLatestHdfForSchool = async (dfeNumber) => {
  // TODO: hdf: role checks? Date checks?
  const school = await schoolDataService.sqlFindOneByDfeNumber(dfeNumber)
  if (!school) {
    return null
  }
  return headteacherDeclarationDataService.sqlFindLatestHdfBySchoolId(school.id)
}

/**
 * Returns true if we are in a check window and the hdf has already been submitted
 * False if we are not in a check window
 * False if we are in a check window and it has not been submitted
 * @param dfeNumber
 * @return {Promise<boolean>}
 */
headteacherDeclarationService.isHdfSubmittedForCurrentCheck = async (dfeNumber) => {
  let checkWindow = await checkWindowV2Service.getActiveCheckWindow()
  if (!checkWindow) {
    return false
  }
  return headteacherDeclarationService.isHdfSubmittedForCheck(dfeNumber, checkWindow.id)
}

/**
 * Returns true if the hdf has already been submitted for the given check
 * False if the hdf has not been submitted
 * @param dfeNumber
 * @return {Promise<boolean>}
 */
headteacherDeclarationService.isHdfSubmittedForCheck = async (dfeNumber, checkWindowId) => {
  if (!dfeNumber || !checkWindowId) {
    throw new Error('dfeNumber and checkWindowId are required')
  }
  const hdf = await headteacherDeclarationDataService.sqlFindHdfForCheck(dfeNumber, checkWindowId)
  if (!hdf) {
    return false
  }
  if (!hdf.signedDate) {
    return false
  }
  return true
}

/**
 * Updates a pupils attendance code
 * @param pupilIds
 * @param code
 * @param userId
 * @return {Promise<object>}
 */
headteacherDeclarationService.updatePupilsAttendanceCode = async (pupilIds, code, userId) => {
  if (!pupilIds || !code || !userId) {
    throw new Error('pupilIds, code and userId are required')
  }
  const attendanceCode = await attendanceCodeDataService.sqlFindOneAttendanceCodeByCode(code)
  if (!attendanceCode) {
    throw new Error(`attendanceCode not found: ${code}`)
  }
  return pupilAttendanceDataService.sqlUpdateBatch(pupilIds, attendanceCode.id, userId)
}

module.exports = headteacherDeclarationService
