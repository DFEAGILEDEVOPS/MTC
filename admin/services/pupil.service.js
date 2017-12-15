const R = require('ramda')
const errorConverter = require('../lib/error-converter')
const pupilValidator = require('../lib/validator/pupil-validator')
const addPupilErrorMessages = require('../lib/errors/pupil').addPupil
const pupilDataService = require('./data-access/pupil.data.service')
const pupilRestartDataService = require('./data-access/pupil-restart.data.service')
const completedCheckDataService = require('./data-access/completed-check.data.service')
const checkDataService = require('./data-access/check.data.service')
const pinValidator = require('../lib/validator/pin-validator')

const pupilService = {}
/**
 * Fetch one pupil filtered by pupil id and school id
 * @param pupilId
 * @param schoolId
 * @returns {Promise.<*>}
 */
pupilService.fetchOnePupil = async (pupilId, schoolId) => {
  // TODO: Introduce integration tests
  return pupilDataService.findOne({_id: pupilId, school: schoolId})
}

// TODO: refactor this when the Cosmos bug is fixed and we can allow $in queries again
pupilService.fetchMultiplePupils = async (pupilIds) => {
  const pupils = []
  for (const id of pupilIds) {
    const pupil = await pupilDataService.findOne({ '_id': id })
    pupils.push(pupil)
  }
  return pupils
}

pupilService.validatePupil = async (pupil, pupilData) => {
  const validationError = await pupilValidator.validate(pupilData)
  try {
    await pupil.validate()
    if (validationError.hasError()) {
      throw new Error('custom validation error')
    }
  } catch (error) {
    if (error.message !== 'custom validation error') {
      // Mongoose error
      // At this point we have validated the schema and may or may not have anything in validationError
      // So = combine all validation errors into one
      const combinedValidationError = errorConverter.fromMongoose(error, addPupilErrorMessages, validationError)
      // error fixup: if the mongoose schema bails out on the dob field - we should make sure we have some
      // actual html fields that have an error.  If we do, we can ditch the mongoose error as being superfluous.
      if (combinedValidationError.isError('dob') && (combinedValidationError.isError('dob-day') || combinedValidationError.isError('dob-month') || combinedValidationError.isError('dob-year'))) {
        combinedValidationError.removeError('dob')
      }
      throw combinedValidationError
    }
    if (validationError.hasError()) {
      throw validationError
    }
  }
  return true
}

/**
 * Fetch pupil's status
 * @param pupil
 * @returns {String}
 */
pupilService.getStatus = async (pupil) => {
  const pupilStatusCodes = await pupilDataService.getStatusCodes()
  const getStatus = (value) => {
    const entry = pupilStatusCodes && R.find(c => c.code === value)(pupilStatusCodes)
    return entry && entry.status
  }
  // Pupil not taking the check
  if (pupil.attendanceCode) return getStatus('NTC')
  // Pupil has an ongoing restart
  const latestPupilRestart = await pupilRestartDataService.findLatest({ pupilId: pupil._id })
  const checkCount = await checkDataService.count({ pupilId: pupil._id, checkStartedAt: { $ne: null } })
  const pupilRestartsCount = await pupilRestartDataService.count({ pupilId: pupil._id, isDeleted: false })
  const isActivePin = pinValidator.isActivePin(pupil.pin, pupil.pinExpiresAt)
  console.log(pupil.lastName, checkCount === pupilRestartsCount)
  const hasActiveRestart = latestPupilRestart && !latestPupilRestart.isDeleted && checkCount === pupilRestartsCount &&
    !isActivePin
  if (hasActiveRestart) return getStatus('RES')
  // Pupil not started
  const hasNotStarted = checkCount === pupilRestartsCount && !isActivePin
  if (hasNotStarted) return getStatus('NTS')
  // Pupil has PIN generated
  const latestCheck = await checkDataService.findLatestCheck({ pupilId: pupil._id })
  const hasPinGenerated = (!latestCheck && checkCount === pupilRestartsCount) && isActivePin
  if (hasPinGenerated) return getStatus('PIN')
  // Pupil's in progress
  const isInProgress = checkCount === pupilRestartsCount && isActivePin
  console.log(pupil.lastName, isInProgress)
  if (isInProgress) return getStatus('INP')
  // Pupil's check started
  const latestCompletedCheck = await completedCheckDataService.find({ 'data.pupil.checkCode': latestCheck.checkCode })
  const hasCheckStarted = latestCheck && latestCheck.checkStartedAt && latestCompletedCheck.length === 0 && !isActivePin
  if (hasCheckStarted) return getStatus('CHS')
  // Pupil has a result
  if (latestCompletedCheck) return getStatus('COM')
}

module.exports = pupilService
