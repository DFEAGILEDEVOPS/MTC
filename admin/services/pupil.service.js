const errorConverter = require('../lib/error-converter')
const pupilValidator = require('../lib/validator/pupil-validator')
const addPupilErrorMessages = require('../lib/errors/pupil').addPupil
const pupilDataService = require('./data-access/pupil.data.service')
const schoolDataService = require('./data-access/school.data.service')

const pupilService = {}

/**
 * Fetch one pupil filtered by pupil id and school id
 * @param pupilId
 * @param schoolId
 * @returns {Promise.<*>}
 */
pupilService.fetchOnePupil = async (pupilId, schoolId) => {
  return pupilDataService.sqlFindOneByIdAndSchool(pupilId, schoolId)
}

/**
 * Fetch one pupil filtered by pupil urlSlug and school id
 * @param urlSlug
 * @param schoolId
 * @returns {Promise.<*>}
 */
pupilService.fetchOnePupilBySlug = async (slug, schoolId) => {
  return pupilDataService.sqlFindOneBySlugAndSchool(slug, schoolId)
}

/**
 * Return a subset of pupil data so their Pins can be printed
 * @param dfeNumber
 * @return {Promise<void>}
 */
pupilService.getPrintPupils = async (dfeNumber) => {
  if (!dfeNumber) {
    throw new Error(`dfeNumber is required`)
  }
  const p1 = pupilDataService.sqlFindPupilsWithActivePins(dfeNumber)
  const p2 = schoolDataService.sqlFindOneByDfeNumber(dfeNumber)
  const [pupils, school] = await Promise.all([p1, p2])
  if (!pupils) { throw new Error(`Pupils not found for ${dfeNumber}`) }
  if (!school) { throw new Error(`School not found for ${dfeNumber}`) }
  return pupils.map(p => ({
    fullName: `${p.foreName} ${p.lastName}`,
    schoolPin: school.pin,
    pupilPin: p.pin
  }))
}

/**
 * Find Pupils using urlSlugs
 * @param {Array} slugs
 * @return {Promise<*>}
 */
pupilService.getPupilsByUrlSlug = async (slugs) => {
  return pupilDataService.sqlFindPupilsByUrlSlug(slugs)
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
 * Sort pupil's array by status.
 * @param pupilsList
 * @param sortDirection
 * @returns {*}
 */
pupilService.sortByStatus = (pupilsList, sortDirection) => {
  if (!pupilsList || pupilsList.length < 1) { return pupilsList }
  sortDirection = sortDirection !== 'asc' ? 'desc' : 'asc'
  return pupilsList.sort((a, b) => {
    if (a.outcome === b.outcome) {
      return 0
    } else if (sortDirection === 'asc') {
      return a.outcome < b.outcome ? -1 : 1
    } else {
      return a.outcome < b.outcome ? 1 : -1
    }
  })
}

/**
 * Sort pupil's array by group.
 * @param pupilsList
 * @param sortDirection
 * @returns {*}
 */
pupilService.sortByGroup = (pupilsList, sortDirection) => {
  if (!pupilsList || pupilsList.length < 1) { return pupilsList }
  sortDirection = sortDirection !== 'asc' ? 'desc' : 'asc'
  return pupilsList.sort((a, b) => {
    if (a.group === '-') {
      return 1
    } else if (b.group === '-') {
      return -1
    } else if (a.group === b.group) {
      return 0
    } else if (sortDirection === 'asc') {
      return a.group < b.group ? -1 : 1
    } else {
      return a.group < b.group ? 1 : -1
    }
  })
}

module.exports = pupilService
