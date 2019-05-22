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
pupilService.fetchOnePupilBySlug = async (urlSlug, schoolId) => {
  return pupilDataService.sqlFindOneBySlugAndSchool(urlSlug, schoolId)
}

/**
 * Return a subset of pupil data so their Pins can be printed
 * @param dfeNumber
 * @return {Promise<void>}
 */
pupilService.getPrintPupils = async (schoolID) => {
  if (!schoolID) {
    throw new Error(`schoolID is required`)
  }
  const p1 = pupilDataService.sqlFindPupilsWithActivePins(schoolID)
  const p2 = schoolDataService.sqlFindOneById(schoolID)
  const [pupils, school] = await Promise.all([p1, p2])
  if (!pupils) { throw new Error(`Pupils not found for ${schoolID}`) }
  if (!school) { throw new Error(`School not found for ${schoolID}`) }
  return pupils.map(p => ({
    fullName: `${p.foreName} ${p.lastName}`,
    schoolPin: school.pin,
    pupilPin: p.pin
  }))
}

/**
 * Find Pupils using urlSlugs
 * @param {Array} slugs
 * @param {number} schoolId - the db id of the school
 * @return {Promise<*>}
 */
pupilService.getPupilsByUrlSlug = async (slugs, schoolId) => {
  // TODO: [JMS] this only seems to be used by the test!
  return pupilDataService.sqlFindPupilsByUrlSlug(slugs, schoolId)
}

/**
 * Get pupils with full names in school.
 * @param {Number} schoolID
 * @returns {Array}
 */
pupilService.getPupilsWithFullNames = async (schoolID) => {
  if (!schoolID) {
    throw new Error('schoolID is not provided')
  }
  const pupils = await pupilDataService.sqlFindPupilsBySchoolID(schoolID)
  return pupils.map(p => ({
    fullName: `${p.lastName} ${p.foreName}${p.middleNames ? ' ' + p.middleNames : ''}`,
    urlSlug: p.urlSlug
  }))
}

module.exports = pupilService
