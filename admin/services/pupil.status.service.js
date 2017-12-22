const R = require('ramda')
const moment = require('moment')
const pupilDataService = require('./data-access/pupil.data.service')
const pupilRestartDataService = require('./data-access/pupil-restart.data.service')
const checkDataService = require('./data-access/check.data.service')
const completedCheckDataService = require('./data-access/completed-check.data.service')
const pinValidator = require('../lib/validator/pin-validator')

const pupilStatusService = {}
/**
 * Fetch pupil's status description
 * @param pupil
 * @returns {String}
 */
pupilStatusService.getStatus = async (pupil) => {
  const pupilStatusCodes = await pupilDataService.getStatusCodes()
  const getStatus = (value) => {
    const entry = pupilStatusCodes && R.find(c => c.code === value)(pupilStatusCodes)
    return entry && entry.statusDesc
  }
  // Pupil not taking the check
  if (pupil.attendanceCode) return getStatus('NTC')
  // Pupil has an ongoing restart
  const latestPupilRestart = await pupilRestartDataService.findLatest({ pupilId: pupil._id })
  const checkCount = await checkDataService.sqlGetNumberOfChecksStartedByPupil(pupil._id)
  const pupilRestartsCount = await pupilRestartDataService.count({ pupilId: pupil._id, isDeleted: false })
  const isActivePin = pinValidator.isActivePin(pupil.pin, pupil.pinExpiresAt)
  const hasActiveRestart = latestPupilRestart && !latestPupilRestart.isDeleted && checkCount === pupilRestartsCount &&
    !isActivePin
  if (hasActiveRestart) return getStatus('RES')
  // Pupil not started
  const hasNotStarted = checkCount === pupilRestartsCount && !isActivePin
  if (hasNotStarted) return getStatus('NTS')
  // Pupil has PIN generated
  const latestCheck = await checkDataService.sqlFindLatestCheck(pupil._id)
  const hasPupilLoggedIn = pupilStatusService.hasPupilLoggedIn(pupilRestartsCount, latestCheck, latestPupilRestart)
  const hasPinGenerated = (!hasPupilLoggedIn && checkCount === pupilRestartsCount) && isActivePin
  if (hasPinGenerated) return getStatus('PIN')
  // Pupil's in progress
  const isInProgress = hasPupilLoggedIn && checkCount === pupilRestartsCount && isActivePin
  if (isInProgress) return getStatus('INP')
  // Pupil's check started
  const latestCompletedCheck = await completedCheckDataService.find({ 'data.pupil.checkCode': latestCheck.checkCode })
  const hasCheckStarted = latestCheck && latestCheck.checkStartedAt && latestCompletedCheck.length === 0 && !isActivePin
  if (hasCheckStarted) return getStatus('CHS')
  // Pupil has a result
  if (latestCompletedCheck) return getStatus('COM')
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
