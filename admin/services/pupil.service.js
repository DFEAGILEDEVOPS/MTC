const mongoose = require('mongoose')

const School = require('../models/school')
const Pupil = require('../models/pupil')
const Answer = require('../models/answer')
const errorConverter = require('../lib/error-converter')
const pupilValidator = require('../lib/validator/pupil-validator')
const addPupilErrorMessages = require('../lib/errors/pupil').addPupil

/** @namespace */

const pupilService = {
  /**
   * Returns an object that consists of a plain JS school data and pupils.
   * @param {number} schoolId - School unique Id.
   */
  fetchPupilsData: async (schoolId) => {
    // TODO: Introduce integration tests
    const [ schoolData, pupils ] = await Promise.all([
      School.findOne({'_id': schoolId}).lean().exec(),
      Pupil.getPupils(schoolId).exec()
    ]).catch((error) => {
      throw new Error(error)
    })
    return {
      schoolData,
      pupils
    }
  },
  /**
   * Returns pupils filtered by school and sorted by field and direction (asc/desc)
   * @param schoolId
   * @param sortingField
   * @param sortingDirection
   * @returns {Promise.<*>}
   */
  fetchSortedPupilsData: async (schoolId, sortingField, sortingDirection) => {
    // TODO: Introduce integration tests
    try {
      const sort = {}
      sort[sortingField] = sortingDirection
      return await Pupil
        .find({
          'school': schoolId
        })
        .sort(sort)
        .lean()
        .exec()
    } catch (error) {
      throw new Error(error)
    }
  },
  /**
   * Fetches latest set of pupils answers who have completed the check.
   * @param {string} id - Pupil Id.
   */
  fetchPupilAnswers: async (id) => {
    // TODO: Introduce integration tests
    try {
      return await Answer.findOne({
        pupil: mongoose.Types.ObjectId(id),
        result: {$exists: true}
      }).sort({createdAt: -1}).exec()
    } catch (error) {
      throw new Error(error)
    }
  },
  /**
   * Fetches score details for pupils who have taken the check.
   * @param {object} answers - Pupil's answers set.
   */
  fetchScoreDetails: (answers) => {
    const pupilScore = answers && answers.result
    const hasScore = !!pupilScore && typeof pupilScore.correct === 'number' && pupilScore.correct >= 0
    const score = pupilScore ? `${pupilScore.correct}/${answers.answers.length}` : 'N/A'
    const percentage = pupilScore ? `${Math.round((pupilScore.correct / answers.answers.length) * 100)}%` : 'N/A'
    return {
      hasScore,
      score,
      percentage
    }
  },

  validatePupil: async (pupil, pupilData) => {
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
}

module.exports = pupilService
