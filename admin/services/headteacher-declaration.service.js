'use strict'

const moment = require('moment-timezone')
const R = require('ramda')

const config = require('../config')
const schoolDataService = require('../services/data-access/school.data.service')
const checkWindowV2Service = require('../services/check-window-v2.service')
const attendanceCodeDataService = require('./data-access/attendance-code.data.service')
const pupilAttendanceDataService = require('../services/data-access/pupil-attendance.data.service')
const headteacherDeclarationDataService = require('./data-access/headteacher-declaration.data.service')
const headteacherDeclarationService = {}
const pupilRegisterService = require('./pupil-register.service')
const settingService = require('./setting.service')

/**
 * Add the pupil `status` field, using the pupil register service to do so.
 * @param {Object} settings
 * @param {Object} pupil
 * @return {Object} partially cloned pupil obj with an additional `status` property
 */
headteacherDeclarationService.addStatus = function addStatus (settings, pupil) {
  const newPupil = R.pickAll(['id', 'foreName', 'lastName', 'middleNames', 'dateOfBirth', 'urlSlug', 'checkStatusCode',
    'group_id', 'reason', 'reasonCode'], pupil)
  newPupil.status = pupilRegisterService.getProcessStatusV2({
    attendanceId: pupil.attendanceId,
    checkComplete: pupil.checkComplete,
    checkReceived: pupil.checkReceived,
    checkStatusCode: pupil.checkStatusCode,
    currentCheckId: pupil.currentCheckId,
    notReceivedExpiryInMinutes: settings.checkTimeLimit,
    pinExpiresAt: pupil.pinExpiresAt,
    pupilCheckComplete: pupil.pupilCheckComplete,
    pupilId: pupil.pupilId,
    pupilLoginDate: pupil.pupilLoginDate,
    restartAvailable: pupil.restartAvailable
  })
  return newPupil
}

/**
 * @typedef {Object} hdfPupil
 * @property {string } foreName,
 * @property {string} lastName,
 * @property {string|null} middleNames,
 * @property {Moment.moment} dateOfBirth,
 * @property {string} urlSlug,
 * @property {pupilStatusCode} pupilStatusCode,
 * @property {string} checkStatusCode,
 * @property {number|null} group_id,
 * @property {string|null} reason,
 * @property {string|null} reasonCode
 */

/**
 * Find the pupils for the given dfe number
 * @param schoolId
 * @return {Promise<{hdfPupil[]}>}
 */
headteacherDeclarationService.findPupilsForSchool = async (schoolId) => {
  if (!schoolId) {
    throw new Error('schoolId is required')
  }

  const settings = await settingService.get()

  // We can get pupils and attendance codes directly from the database...
  const pupils = await headteacherDeclarationDataService.sqlFindPupilsFullStatus(schoolId)
  // ...and add the HDF status in.  The HDF status is the same as the pupil outcome status on the pupil register / status
  // screen, but the Non-attendance reason shown in the status, rather than 'Not attending'.
  const pupilsWithStatus = pupils.map(R.partial(headteacherDeclarationService.addStatus, [settings]))
  return pupilsWithStatus
}

/**
 * Find the a pupil for the given pupilId and dfeNumber
 * @param pupilId
 * @param dfeNumber
 * @return {Promise<object>}
 */
headteacherDeclarationService.findPupilBySlugAndSchoolId = async function findPupilBySlugAndSchoolId (urlSlug, schoolId) {
  if (!urlSlug) {
    throw new Error('urlSlug param is required')
  }
  if (!schoolId) {
    throw new Error('schoolId param is required')
  }
  const settings = await settingService.get()
  const pupil = await headteacherDeclarationDataService.sqlFindOnePupilFullStatus(urlSlug, schoolId)
  const newPupil = this.addStatus(settings, pupil)
  return newPupil
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
 * @param {number} schoolId
 * @param {number} userId
 * @param {number} schoolId
 * @param {object} checkEndDate
 * @param {string} timezone
 * @return {Promise<void>}
 */
headteacherDeclarationService.submitDeclaration = async (form, userId, schoolId, checkEndDate, timezone) => {
  const school = await schoolDataService.sqlFindOneById(schoolId)

  if (!school) {
    throw new Error(`school ${schoolId} not found`)
  }

  const hdfEligibility = await headteacherDeclarationService.getEligibilityForSchool(schoolId, checkEndDate, timezone)
  if (!hdfEligibility) {
    throw new Error('Not eligible to submit declaration')
  }

  const checkWindow = await checkWindowV2Service.getActiveCheckWindow()
  if (!checkWindow || !checkWindow.id) {
    throw new Error('Active check window not found')
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
 * @param schoolId
 * @param checkWindowId
 * @return {Promise<boolean>}
 */
headteacherDeclarationService.isHdfSubmittedForCurrentCheck = async (schoolId, checkWindowId) => {
  if (!checkWindowId || !schoolId) {
    return false
  }
  return headteacherDeclarationService.isHdfSubmittedForCheck(schoolId, checkWindowId)
}

/**
 * Returns true if the hdf has already been submitted for the given check
 * False if the hdf has not been submitted
 * @param schoolId
 * @param checkWindowId
 * @return {Promise<boolean>}
 */
headteacherDeclarationService.isHdfSubmittedForCheck = async (schoolId, checkWindowId) => {
  if (!schoolId || !checkWindowId) {
    throw new Error('schoolId and checkWindowId are required')
  }
  const hdf = await headteacherDeclarationDataService.sqlFindHdfForCheck(schoolId, checkWindowId)
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
