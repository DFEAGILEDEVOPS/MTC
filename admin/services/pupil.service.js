const Pupil = require('../models/pupil')
const errorConverter = require('../lib/error-converter')
const pupilValidator = require('../lib/validator/pupil-validator')
const addPupilErrorMessages = require('../lib/errors/pupil').addPupil

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

module.exports = pupilService
