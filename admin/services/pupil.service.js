const mongoose = require('mongoose')
const moment = require('moment')
const Pupil = require('../models/pupil')
const Answer = require('../models/answer')
const errorConverter = require('../lib/error-converter')
const pupilValidator = require('../lib/validator/pupil-validator')
const addPupilErrorMessages = require('../lib/errors/pupil').addPupil
const pupilDataService = require('../services/data-access/pupil.data.service')
const generatePinsService = require('../services/generate-pins.service')

const pupilService = {}
/**
 * Fetch one pupil filtered by pupil id and school id
 * @param pupilId
 * @param schoolId
 * @returns {Promise.<*>}
 */
pupilService.fetchOnePupil = async (pupilId, schoolId) => {
  // TODO: Introduce integration tests
  const pupil = await Pupil
    .findOne({ '_id': pupilId, 'school': schoolId })
    .exec()
  return pupil
}

pupilService.fetchMultiplePupils = async (pupilIds) => {
  const pupils = []
  for (var index = 0; index < pupilIds.length; index++) {
    let pupilId = pupilIds[ index ]
    const pupil = await Pupil.findOne({ '_id': pupilId }).exec()
    pupils.push(pupil)
  }
  return pupils
}
/**
 * Fetches latest set of pupils answers who have completed the check.
 * @param {string} id - Pupil Id.
 */
pupilService.fetchAnswers = async (id) => {
  // TODO: Introduce integration tests
  const answers = await Answer.findOne({
    pupil: mongoose.Types.ObjectId(id),
    result: { $exists: true }
  }).sort({ createdAt: -1 }).exec()
  return answers
}
/**
 * Calculates the score of a check that the pupil has taken.
 * @param {object} results - The check results.
 */
pupilService.calculateScorePercentage = (results) => {
  const errorMessage = 'Error Calculating Score'
  if (!results) return undefined

  if (results.marks === undefined || results.maxMarks === undefined) {
    return errorMessage
  }

  if (results.marks > results.maxMarks) {
    return errorMessage
  }

  let percentage = (results.marks / results.maxMarks) * 100
  var rounded = Math.round(percentage * 10) / 10
  return rounded
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
 * Get pupils with active pins
 * @param schoolId
 * @returns {Array}
 */
pupilService.getPupilsWithActivePins = async (schoolId) => {
  let pupils = await pupilDataService.getSortedPupils(schoolId, 'lastName', 'asc')
  pupils = pupils
    .filter(p => generatePinsService.isValidPin(p.pin, p.pinExpiresAt))
    .map(({ _id, pin, dob, foreName, middleNames, lastName }) =>
      ({ _id, pin, dob: moment(dob).format('DD MMM YYYY'), foreName, middleNames, lastName }))
  pupils = pupilService.addIdentificationFlags(pupils)
  return pupils
}

/**
 * Adds show Date of Birth flag for pupils that have been alphabetically sorted by last name and have equal full names
 * @param {Array} pupils
 * @returns {Array}
 */
pupilService.addIdentificationFlags = (pupils) => {
  pupils.forEach((p, i) => {
    const currentPupil = pupils[ i ]
    const nextPupil = pupils[ i + 1 ]
    if (nextPupil === undefined) return
    if (currentPupil.foreName === nextPupil.foreName && currentPupil.lastName === nextPupil.lastName &&
      currentPupil.dob === nextPupil.dob) {
      currentPupil.showMiddleNames = true
      nextPupil.showMiddleNames = true
    }
    if (currentPupil.foreName === nextPupil.foreName && currentPupil.lastName === nextPupil.lastName) {
      currentPupil.showDoB = true
      nextPupil.showDoB = true
    }
  })
  return pupils
}

module.exports = pupilService
