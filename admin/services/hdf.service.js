'use strict'

const moment = require('moment-timezone')

const config = require('../config')
const schoolDataService = require('./data-access/school.data.service')
const checkWindowV2Service = require('./check-window-v2.service')
const attendanceCodeDataService = require('./data-access/attendance-code.data.service')
const pupilAttendanceDataService = require('./data-access/pupil-attendance.data.service')
const pupilStatusService = require('./pupil-status.service')
const headteacherDeclarationDataService = require('./data-access/headteacher-declaration.data.service')
const pupilStatusDataService = require('./data-access/pupil-status.data.service')
const hdfService = {}
const settingService = require('./setting.service')
const redisCacheService = require('./data-access/redis-cache.service')
const redisKeyService = require('./redis-key.service')
const { PupilFrozenService } = require('./pupil-frozen.service/pupil-frozen.service')
const dateService = require('./date.service')

/**
 * @typedef {Object} hdfPupil
 * @property {number} pupilId
 * @property {string } foreName
 * @property {string} lastName
 * @property {string|null} middleNames
 * @property {moment.Moment} dateOfBirth
 * @property {string} urlSlug
 * @property {number|null} group_id
 * @property {string|null} reason
 * @property {string|null} reasonCode
 * @property {string} status - pupil status
 */

/**
 * Find the pupils for the given dfe number
 * @param schoolId
 * @return {Promise<hdfPupil[]>}
 */
hdfService.findPupilsForSchool = async (schoolId) => {
  if (!schoolId) {
    throw new Error('schoolId is required')
  }
  // The HDF pupil status is the same as the pupil outcome status on the pupil register / status screen
  return pupilStatusService.getPupilStatusData(schoolId)
}

/**
 * Find the a pupil for the given pupilId and dfeNumber
 * @param urlSlug
 * @param schoolId
 * @return {Promise<object>}
 */
hdfService.findPupilBySlugAndSchoolId = async function findPupilBySlugAndSchoolId (urlSlug, schoolId) {
  if (!urlSlug) {
    throw new Error('urlSlug param is required')
  }
  if (!schoolId) {
    throw new Error('schoolId param is required')
  }
  const settings = await settingService.get()
  const pupil = await pupilStatusDataService.sqlFindOnePupilFullStatus(urlSlug, schoolId)
  return pupilStatusService.addStatus(settings, pupil)
}

/**
 * Determine eligibility for school on signing HDF in current state
 * @param schoolId
 * @param timezone
 * @returns {Promise<boolean>}
 */
hdfService.canBeSigned = async (schoolId, timezone) => {
  /* establish which phase of the check window we are in...
    - checks still active
    - checks closed, but within last 14 days (can still sign), within admin period
    - outside admin period
  */
  const currentDate = dateService.utcNowAsMoment().tz(timezone || config.DEFAULT_TIMEZONE)
  const settings = await settingService.get()
  const checkWindowDates = checkWindowV2Service.getActiveCheckWindow()
  if (!currentDate.isSameOrAfter(checkWindowDates.checkStartDate)) return false
  // const OnOrBeforeCheckEndDate = currentDate.isSameOrBefore(checkWindowDates.checkEndDate)
}

/**
 * Fetch pupils and return eligibility to generate HDF
 * @param schoolId
 * @param checkEndDate
 * @param timezone
 * @returns {Promise<boolean>}
 */
hdfService.getEligibilityForSchool = async (schoolId, checkEndDate, timezone) => {
  if (!checkEndDate) {
    throw new Error('Check end date missing or not found')
  }
  const currentDate = moment.tz(timezone || config.DEFAULT_TIMEZONE)
  const settings = await settingService.get()

  if (settings.isPostAdminEndDateUnavailable === false) {
    const doNotIncludeFraction = false
    // allow signing if within 14 days of live check period end date
    const daysSinceCheckEndDate = currentDate.diff(moment(checkEndDate), 'days', doNotIncludeFraction)
    return daysSinceCheckEndDate < 15
  }

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
 * @return {Promise<any>}
 */
hdfService.submitDeclaration = async (form, userId, schoolId, checkEndDate, timezone) => {
  const school = await schoolDataService.sqlFindOneById(schoolId)

  if (!school) {
    throw new Error(`school ${schoolId} not found`)
  }

  const hdfEligibility = await hdfService.getEligibilityForSchool(schoolId, checkEndDate, timezone)
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
hdfService.findLatestHdfForSchool = async (dfeNumber) => {
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
hdfService.isHdfSubmittedForCurrentCheck = async (schoolId, checkWindowId) => {
  if (!checkWindowId || !schoolId) {
    return false
  }
  return hdfService.isHdfSubmittedForCheck(schoolId, checkWindowId)
}

/**
 * Returns true if the hdf has already been submitted for the given check
 * False if the hdf has not been submitted
 * @param schoolId
 * @param checkWindowId
 * @return {Promise<boolean>}
 */
hdfService.isHdfSubmittedForCheck = async (schoolId, checkWindowId) => {
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
hdfService.updatePupilsAttendanceCode = async (pupilIds, code, userId, schoolId) => {
  if (!pupilIds || !code || !userId) {
    throw new Error('pupilIds, code and userId are required')
  }
  await PupilFrozenService.throwIfFrozenByIds(pupilIds)
  const attendanceCode = await attendanceCodeDataService.sqlFindOneAttendanceCodeByCode(code)
  if (!attendanceCode) {
    throw new Error(`attendanceCode not found: ${code}`)
  }
  await pupilAttendanceDataService.sqlUpdateBatch(pupilIds, attendanceCode.id, userId)
  await redisCacheService.drop(redisKeyService.getSchoolResultsKey(schoolId))
}

module.exports = hdfService
