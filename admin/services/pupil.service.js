const pupilDataService = require('./data-access/pupil.data.service')
const sorting = require('../helpers/table-sorting')

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
pupilService.fetchOnePupilBySlug = async (urlSlug, schoolId) => {
  return pupilDataService.sqlFindOneBySlugAndSchool(urlSlug, schoolId)
}

/**
 * Get pupils with full names in school.
 * @param {Number} schoolId
 * @returns {Array}
 */
pupilService.getPupilsWithFullNames = async (schoolId) => {
  if (!schoolId) {
    throw new Error('schoolId is required')
  }
  const pupils = await pupilDataService.sqlFindPupilsBySchoolId(schoolId)
  const sortedPupils = sorting.sortByProps('lastName', pupils)
  return sortedPupils.map(p => ({
    fullName: `${p.lastName} ${p.foreName}${p.middleNames ? ' ' + p.middleNames : ''}`,
    urlSlug: p.urlSlug
  }))
}

/**
 * Fetch all pupils for a school by schoolId sorted by lastname ascending.
 * Sorting to be removed in a future version
 * @param schoolId required
 * @returns {Promise<*>}
 */
pupilService.findPupilsBySchoolId = async function findPupilsBySchoolId (schoolId) {
  if (!schoolId) {
    throw new Error('schoolId is required')
  }
  const pupils = await pupilDataService.sqlFindPupilsBySchoolId(schoolId)
  const sortedPupils = sorting.sortByProps('lastName', pupils)
  return sortedPupils
}

/**
 * Fetch all pupils for a school by schoolId sorted by lastname ascending.
 * Sorting to be removed in a future version
 * @param urlSlug required
 * @param schoolId required
 * @returns {Promise<*>}
 */
pupilService.findOneBySlugAndSchool = function findOneBySlugAndSchool (urlSlug, schoolId) {
  if (!schoolId) {
    throw new Error('schoolId is required')
  }
  if (!urlSlug) {
    throw new Error('urlSlug is required')
  }
  return pupilDataService.sqlFindOneBySlugAndSchool(urlSlug, schoolId)
}

module.exports = pupilService
