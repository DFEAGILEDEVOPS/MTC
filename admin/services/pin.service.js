const moment = require('moment')
const pupilDataService = require('../services/data-access/pupil.data.service')
const schoolDataService = require('../services/data-access/school.data.service')
const pupilIdentificationFlagService = require('../services/pupil-identification-flag.service')
const pinValidator = require('../lib/validator/pin-validator')
const pinService = {}

/**
 * Get pupils with active pins
 * @param schoolId
 * @returns {Array}
 */
pinService.getPupilsWithActivePins = async (schoolId) => {
  let pupils = await pupilDataService.getSortedPupils(schoolId, 'lastName', 'asc')
  pupils = pupils
    .filter(p => pinValidator.isValidPin(p.pin, p.pinExpiresAt))
    .map(({ _id, pin, dob, foreName, middleNames, lastName }) =>
      ({ _id, pin, dob: moment(dob).format('DD MMM YYYY'), foreName, middleNames, lastName }))
  pupils = pupilIdentificationFlagService.addIdentificationFlags(pupils)
  return pupils
}

/**
 * Get active school Password
 * @param schoolId
 * @returns {String}
 */
pinService.getActiveSchool = async (schoolId) => {
  const school = await schoolDataService.findOne({_id: schoolId})
  if (!pinValidator.isValidPin(school.schoolPin, school.pinExpiresAt)) {
    return null
  }
  return school
}

module.exports = pinService
