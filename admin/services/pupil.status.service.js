const R = require('ramda')
const moment = require('moment')
const pupilRestartDataService = require('./data-access/pupil-restart.data.service')
const pupilAttendanceDataService = require('./data-access/pupil-attendance.data.service')
const checkDataService = require('./data-access/check.data.service')
const pinValidator = require('../lib/validator/pin-validator')
const pupilStatusCodeDataService = require('./data-access/pupil-status-code.data.service')

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
 * Fetch pupils status descriptions
 * @param {Array} pupils
 * @returns {Array}
 */
pupilStatusService.getPupilsStatus = async (pupils) => {
  return Promise.all(pupils.map(async p => {
    const pupilStatus = await pupilStatusService.getStatus(p)
    return {
      pupilId: p.id,
      status: pupilStatus
    }
  }))
}

module.exports = pupilStatusService
