const R = require('ramda')
const pupilAccessArrangementsService = require('../services/pupil-access-arrangements.service')
const pupilService = require('../services/pupil.service')

const pupilAccessArrangementsEditService = {}

/**
 * Get pupil access arrangements edit data
 * @param {Object} submittedData
 * @param {String} pupilUrlSlug
 * @param {Number} schoolId
 * @returns {Promise<Object>}
 */
pupilAccessArrangementsEditService.getEditData = async (submittedData, pupilUrlSlug, schoolId) => {
  if (!pupilUrlSlug) {
    throw new Error('Pupil url slug not provided')
  }
  const existingData = R.clone(submittedData)
  let formData
  if (Object.keys(existingData).length === 0) {
    formData = await pupilAccessArrangementsService.getPupilEditFormData(pupilUrlSlug)
  } else {
    console.log(`GUY: fetching pupil data with pupilUrlSlug:${pupilUrlSlug} dfeNumber: ${schoolId}`)
    const pupil = await pupilService.fetchOnePupilBySlug(pupilUrlSlug, schoolId)
    formData = existingData
    formData.foreName = pupil.foreName
    formData.lastName = pupil.lastName
  }
  return formData
}

module.exports = pupilAccessArrangementsEditService
