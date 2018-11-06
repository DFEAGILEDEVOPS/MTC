const azureQueueService = require('./azure-queue.service')
const checkDataService = require('./data-access/check.data.service')
const moment = require('moment')
const monitor = require('../helpers/monitor')
const pinValidator = require('../lib/validator/pin-validator')
const pupilAttendanceDataService = require('./data-access/pupil-attendance.data.service')
const pupilDataService = require('./data-access/pupil.data.service')
const pupilRestartDataService = require('./data-access/pupil-restart.data.service')
const pupilStatusCodeDataService = require('./data-access/pupil-status-code.data.service')
const R = require('ramda')

const pupilStatusService = {}

/**
 * Fetch pupil's status description
 * @param pupil
 * @returns {String}
 */
pupilStatusService.getStatus = async (pupil) => {
  // pupils is from SQL server
  const pupilStatusCodes = await pupilStatusCodeDataService.sqlFindStatusCodes()

  const getStatusDescription = (value) => {
    const entry = pupilStatusCodes && R.find(c => c.code === value)(pupilStatusCodes)
    return entry && entry.description
  }

  // Pupil not taking the check
  const pupilAttendance = await pupilAttendanceDataService.findOneByPupilId(pupil.id)
  if (pupilAttendance && pupilAttendance.attendanceCode_id) return getStatusDescription('NTC')
  // Pupil has an ongoing restart
  const latestPupilRestart = await pupilRestartDataService.sqlFindLatestRestart(pupil.id)
  const checkCount = await checkDataService.sqlFindNumberOfChecksStartedByPupil(pupil.id)
  const pupilRestartsCount = await pupilRestartDataService.sqlGetNumberOfRestartsByPupil(pupil.id)
  const isActivePin = pinValidator.isActivePin(pupil.pin, pupil.pinExpiresAt)
  const hasActiveRestart = latestPupilRestart && !latestPupilRestart.isDeleted && checkCount === pupilRestartsCount &&
    !isActivePin
  if (hasActiveRestart) return getStatusDescription('RES')
  // Pupil not started
  const hasNotStarted = checkCount === pupilRestartsCount && !isActivePin
  if (hasNotStarted) return getStatusDescription('NTS')
  // Pupil has PIN generated
  let latestCheck = await checkDataService.sqlFindLastCheckByPupilId(pupil.id)
  const hasPupilLoggedIn = pupilStatusService.hasPupilLoggedIn(pupilRestartsCount, latestCheck, latestPupilRestart)
  const hasPinGenerated = (!hasPupilLoggedIn && checkCount === pupilRestartsCount) && isActivePin
  if (hasPinGenerated) return getStatusDescription('PIN')
  // Pupil's in progress
  const isInProgress = hasPupilLoggedIn && checkCount === pupilRestartsCount && isActivePin
  if (isInProgress) return getStatusDescription('INP')
  // Pupil's check started
  const latestStartedCheck = await checkDataService.sqlFindLastStartedCheckByPupilId(pupil.id)
  const hasCheckStarted = latestStartedCheck && latestStartedCheck.startedAt && !latestStartedCheck.data && !isActivePin
  if (hasCheckStarted) return getStatusDescription('CHS')
  // Pupil has a result
  if (latestStartedCheck.data) return getStatusDescription('COM')
}

/**
 * Determine if pupil has logged in after pin generation
 * @param pupilRestartsCount
 * @param latestCheck
 * @param latestPupilRestart
 * @returns {String}
 */
pupilStatusService.hasPupilLoggedIn = (pupilRestartsCount, latestCheck, latestPupilRestart) => {
  const initialLogIn = pupilRestartsCount === 0 && !!(latestCheck && latestCheck.pupilLoginDate)
  const restartLogIn = pupilRestartsCount > 0 && latestCheck && latestCheck.pupilLoginDate && latestPupilRestart &&
    moment(latestCheck.pupilLoginDate).isAfter(latestPupilRestart.createdAt)
  return initialLogIn || restartLogIn
}

/**
 * Make a request to the pupil status service to recalculate the status for one or more pupils.
 * This function has to fabricate a checkCode as in the not-taking-check example one isn't available.
 * @param {[number]}postedPupilSlugs
 */
pupilStatusService.recalculateStatusByPupilSlugs = async (pupilSlugs, schoolId) => {
  if (!(Array.isArray(pupilSlugs) && pupilSlugs.length > 0)) {
    throw new Error('Invalid parameter: pupilSlugs')
  }

  const pupils = await pupilDataService.sqlFindPupilsByUrlSlug(pupilSlugs, schoolId)

  for (let pupil of pupils) {
    azureQueueService.addMessage('pupil-status', { version: 1, pupilId: pupil.id, checkCode: `pupilId-${pupil.id}` })
  }
}

/**
 * Make a request to the pupil status service to recalculate the status for one or more pupils.
 * Same as recalculateStatusByPupilSlugs, but using pupil Ids as that is what the restart controller is using.
 * @param {[number]} pupilIds - array of numeric pupil IDs
 * @param {number} schoolId - ID of school in school table
 */
pupilStatusService.recalculateStatusByPupilIds = async (pupilIds, schoolId) => {
  if (!(Array.isArray(pupilIds) && pupilIds.length > 0)) {
    throw new Error('Invalid parameter: pupilIds')
  }

  const pupils = await pupilDataService.sqlFindByIds(pupilIds, schoolId)

  for (let pupil of pupils) {
    azureQueueService.addMessage('pupil-status', { version: 1, pupilId: pupil.id, checkCode: `pupilId-${pupil.id}` })
  }
}

module.exports = monitor('pupil-status.service', pupilStatusService)
