const R = require('ramda')
const pupilAccessArrangementsDataService = require('../services/data-access/pupil-access-arrangements.data.service')
const pupilIdentificationFlag = require('../services/pupil-identification-flag.service')
const monitor = require('../helpers/monitor')

const pupilAccessArrangementsService = {}

/**
 * Returns pupils with associated access arrangements
 * @param {Number} dfeNumber
 * @returns {Promise<Array>}
 */
pupilAccessArrangementsService.getPupils = async (dfeNumber) => {
  const accessArrangementsData = await pupilAccessArrangementsDataService.sqFindPupilsWithAccessArrangements(dfeNumber)
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
      ? val.description.slice(0, requiredTextIndex) : val.description
    acc[val.urlSlug].arrangements && acc[val.urlSlug].arrangements.push(description)
    return acc
  }, {})
  const pupilsWithAccessArrangements = accessArrangementsHashmap && Object.keys(accessArrangementsHashmap).map((key) => accessArrangementsHashmap[key])
  return pupilIdentificationFlag.addIdentificationFlags(pupilsWithAccessArrangements)
}

module.exports = monitor('pupil-access-arrangements.service', pupilAccessArrangementsService)
