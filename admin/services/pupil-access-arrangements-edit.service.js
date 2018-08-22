const R = require('ramda')
const pupilAccessArrangementsService = require('../services/pupil-access-arrangements.service')
const pupilService = require('../services/pupil.service')
const monitor = require('../helpers/monitor')

const pupilAccessArrangementsEditService = {}

/**
 * Get pupil access arrangements edit data
 * @returns {Promise<Array>}
 */
pupilAccessArrangementsEditService.getEditData = async (requestData, pupilUrlSlug, dfeNumber) => {
  if (!pupilUrlSlug) {
    throw new Error('Pupil url slug not provided')
  }
  const reqBody = R.clone(requestData)
  let formData
  if (Object.keys(reqBody).length === 0) {
    formData = await pupilAccessArrangementsService.getPupilEditFormData(pupilUrlSlug)
  } else {
    const pupil = await pupilService.fetchOnePupilBySlug(pupilUrlSlug, dfeNumber)
    formData = reqBody
    formData.foreName = pupil.foreName
    formData.lastName = pupil.lastName
  }
  return formData
}

module.exports = monitor('pupil-access-arrangements-edit.service', pupilAccessArrangementsEditService)
