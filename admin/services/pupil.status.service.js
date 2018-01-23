const R = require('ramda')
const moment = require('moment')
const pupilRestartDataService = require('./data-access/pupil-restart.data.service')
const checkDataService = require('./data-access/check.data.service')
const completedCheckDataService = require('./data-access/completed-check.data.service')
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
  if (pupil.attendanceCode) return getStatusDescription('NTC')
  // Pupil has an ongoing restart
  const latestPupilRestart = await pupilRestartDataService.findLatest({ pupilId: pupil._id })
  const checkCount = await checkDataService.sqlFindNumberOfChecksStartedByPupil(pupil._id)
  const pupilRestartsCount = await pupilRestartDataService.count({ pupilId: pupil._id, isDeleted: false })
  const isActivePin = pinValidator.isActivePin(pupil.pin, pupil.pinExpiresAt)
  const hasActiveRestart = latestPupilRestart && !latestPupilRestart.isDeleted && checkCount === pupilRestartsCount &&
    !isActivePin
  if (hasActiveRestart) return getStatusDescription('RES')
  // Pupil not started
  const hasNotStarted = checkCount === pupilRestartsCount && !isActivePin
  if (hasNotStarted) return getStatusDescription('NTS')
  // Pupil has PIN generated
  const latestCheck = await checkDataService.sqlFindLatestCheck(pupil._id)
  const hasPupilLoggedIn = pupilStatusService.hasPupilLoggedIn(pupilRestartsCount, latestCheck, latestPupilRestart)
  const hasPinGenerated = (!hasPupilLoggedIn && checkCount === pupilRestartsCount) && isActivePin
  if (hasPinGenerated) return getStatusDescription('PIN')
  // Pupil's in progress
  const isInProgress = hasPupilLoggedIn && checkCount === pupilRestartsCount && isActivePin
  if (isInProgress) return getStatusDescription('INP')
  // Pupil's check started
  const latestCompletedCheck = await completedCheckDataService.sqlFindOne(latestCheck.checkCode)
  const hasCheckStarted = latestCheck && latestCheck.checkStartedAt && latestCompletedCheck.length === 0 && !isActivePin
  if (hasCheckStarted) return getStatusDescription('CHS')
  // Pupil has a result
  if (latestCompletedCheck) return getStatusDescription('COM')
}

/**
 * Determine if pupil has logged in after pin generation
 * @param pupilRestartsCount
 * @param latestCheck
 * @param latestPupilRestart
 * @returns {String}
 */
pupilStatusService.hasPupilLoggedIn = (pupilRestartsCount, latestCheck, latestPupilRestart) => {
  const initialLogIn = pupilRestartsCount === 0 && !!latestCheck
  const restartLogIn = pupilRestartsCount > 0 && latestCheck && latestPupilRestart &&
    moment(latestCheck.pupilLoginDate).isAfter(latestPupilRestart.createdAt)
  return initialLogIn || restartLogIn
}

module.exports = pupilStatusService
