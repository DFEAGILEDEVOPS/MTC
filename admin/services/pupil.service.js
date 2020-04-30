const pupilDataService = require('./data-access/pupil.data.service')

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
    throw new Error('schoolId is not provided')
  }
  const pupils = await pupilDataService.sqlFindPupilsBySchoolId(schoolId)
  return pupils.map(p => ({
    fullName: `${p.lastName} ${p.foreName}${p.middleNames ? ' ' + p.middleNames : ''}`,
    urlSlug: p.urlSlug
  }))
}

/**
 * Fetch all pupils for a school by schoolId sorted by lastname ascending.
 * Sorting to be removed in a future version
 * @param schoolId
 * @returns {Promise<*>}
 */
pupilService.findPupilsBySchoolId = function findPupilsBySchoolId (schoolId) {
  if (!schoolId) {
    throw new Error('schoolId is not provided')
  }
  return pupilDataService.sqlFindPupilsBySchoolId(schoolId)
}

module.exports = pupilService
