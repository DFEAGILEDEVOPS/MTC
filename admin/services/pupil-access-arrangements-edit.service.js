const R = require('ramda')
const pupilAccessArrangementsService = require('../services/pupil-access-arrangements.service')
const pupilService = require('../services/pupil.service')
const monitor = require('../helpers/monitor')

const pupilAccessArrangementsEditService = {}

/**
 * Get pupil access arrangements edit data
 * @param {Object} submittedData
 * @param {String} pupilUrlSlug
 * @param {Number} dfeNumber
 * @returns {Object}
 */
pupilAccessArrangementsEditService.getEditData = async (submittedData, pupilUrlSlug, dfeNumber) => {
  if (!pupilUrlSlug) {
    throw new Error('Pupil url slug not provided')
  }
  const existingData = R.clone(submittedData)
  let formData
  if (Object.keys(existingData).length === 0) {
    formData = await pupilAccessArrangementsService.getPupilEditFormData(pupilUrlSlug)
  } else {
    const pupil = await pupilService.fetchOnePupilBySlug(pupilUrlSlug, dfeNumber)
    formData = existingData
    formData.foreName = pupil.foreName
    formData.lastName = pupil.lastName
  }
  return formData
}

module.exports = monitor('pupil-access-arrangements-edit.service', pupilAccessArrangementsEditService)
