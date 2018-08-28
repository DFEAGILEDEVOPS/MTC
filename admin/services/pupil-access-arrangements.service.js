const R = require('ramda')
const pupilAccessArrangementsDataService = require('../services/data-access/pupil-access-arrangements.data.service')
const pupilIdentificationFlag = require('../services/pupil-identification-flag.service')
const monitor = require('../helpers/monitor')

const pupilAccessArrangementsService = {}

/**
 * Returns pupils with associated access arrangements
 * @param {Number} dfeNumber
 * @returns {Array}
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

/**
 * Returns pupils edit form data
 * @param {String} urlSlug
 * @returns {Object}
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
    acc.inputAssistanceInformation = acc.inputAssistanceInformation || item.inputAssistanceInformation
    acc.questionReaderOtherInformation = acc.questionReaderOtherInformation || item.questionReaderOtherInformation
    acc.questionReaderReason = acc.questionReaderReason || item.questionReaderReasonCode
    acc.accessArrangements.push(item.accessArrangementCode)
    return acc
  }, { accessArrangements: [] })
  formData.isEditView = true
  return formData
}

module.exports = monitor('pupil-access-arrangements.service', pupilAccessArrangementsService)
