const R = require('ramda')
const { validate: uuidValidator } = require('uuid')
const preparedCheckSyncService = require('../services/prepared-check-sync.service')
const pupilAccessArrangementsDataService = require('../services/data-access/pupil-access-arrangements.data.service')
const pupilDataService = require('../services/data-access/pupil.data.service')
const pupilIdentificationFlag = require('../services/pupil-identification-flag.service')
const { PupilFrozenService } = require('./pupil-frozen/pupil-frozen.service')

const pupilAccessArrangementsService = {}

/**
 * Returns pupils with associated access arrangements
 * @param {Number} schoolId
 * @returns {Promise<Array>}
 */
pupilAccessArrangementsService.getPupils = async (schoolId) => {
  const accessArrangementsData = await pupilAccessArrangementsDataService.sqFindPupilsWithAccessArrangements(schoolId)
  const accessArrangementsHashmap = accessArrangementsData.reduce((acc, val) => {
    const current = R.clone(val)
    delete current.description
    if (!acc[val.urlSlug] || Object.keys(acc[val.urlSlug]).length === 0) {
      acc[val.urlSlug] = current
      acc[val.urlSlug].arrangements = []
    }
    // Remove reason require text from string
    const requiredTextIndex = val.description.indexOf(' (reason required)')
    const description = requiredTextIndex !== -1
      ? val.description.slice(0, requiredTextIndex)
      : val.description
    acc[val.urlSlug].arrangements && acc[val.urlSlug].arrangements.push(description)
    return acc
  }, {})
  const pupilsWithAccessArrangements = accessArrangementsHashmap && Object.keys(accessArrangementsHashmap).map((key) => accessArrangementsHashmap[key])
  return pupilIdentificationFlag.sortAndAddIdentificationFlags(pupilsWithAccessArrangements)
}

/**
 * Returns pupils with eligible for access arrangements
 * @param {Number} schoolId
 * @returns {Promise<Array>}
 */
pupilAccessArrangementsService.getEligiblePupilsWithFullNames = async (schoolId) => {
  if (!schoolId) {
    throw new Error('schoolId is not provided')
  }
  const pupils = await pupilAccessArrangementsDataService.sqlFindEligiblePupilsBySchoolId(schoolId)
  return pupils.map(p => ({
    fullName: `${p.lastName}, ${p.foreName}${p.middleNames ? ' ' + p.middleNames : ''}`,
    urlSlug: p.urlSlug
  }))
}

/**
 * Returns pupils edit form data
 * @param {String} urlSlug
 * @returns {Promise<Object>}
 */
pupilAccessArrangementsService.getPupilEditFormData = async (urlSlug) => {
  if (!urlSlug) {
    throw new Error('Pupil url slug is not provided')
  }
  const pupilAccessArrangementsData = await pupilAccessArrangementsDataService.sqlFindAccessArrangementsByUrlSlug(urlSlug)
  const formData = pupilAccessArrangementsData.reduce((acc, item) => {
    acc.pupilUrlSlug = acc.pupilUrlSlug || item.urlSlug
    acc.foreName = acc.foreName || item.foreName
    acc.lastName = acc.lastName || item.lastName
    acc.accessArrangements.push(item.accessArrangementCode)
    return acc
  }, { accessArrangements: [] })
  formData.isEditView = true
  return formData
}

/**
 * Delete pupil's access arrangements
 * @param {String} pupilUrlSlug
 * @param {Number} schoolId
 * @returns {Promise<Object>}
 */
pupilAccessArrangementsService.deletePupilAccessArrangements = async (pupilUrlSlug, schoolId) => {
  if (!pupilUrlSlug) {
    throw new Error('Pupil url slug is not provided')
  }
  if (!uuidValidator(pupilUrlSlug)) {
    throw new Error(`pupilUrlSlug: '${pupilUrlSlug}' is not a valid UUID`)
  }
  await PupilFrozenService.throwIfFrozenByUrlSlugs([pupilUrlSlug])
  const pupil = await pupilDataService.sqlFindOneBySlugAndSchool(pupilUrlSlug, schoolId)
  if (!pupil) {
    throw new Error(`Pupil ${pupilUrlSlug} not found in school ID ${schoolId}`)
  }
  await pupilAccessArrangementsDataService.sqlDeletePupilsAccessArrangements(pupilUrlSlug)
  await preparedCheckSyncService.addMessages(pupilUrlSlug)
  return pupil
}
module.exports = pupilAccessArrangementsService
