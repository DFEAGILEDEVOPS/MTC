const moment = require('moment')
const ObjectId = require('mongoose').Types.ObjectId
const pupilDataService = require('../services/data-access/pupil.data.service')
const checkDataService = require('../services/data-access/check.data.service')
const schoolDataService = require('../services/data-access/school.data.service')
const pupilIdentificationFlagService = require('../services/pupil-identification-flag.service')
const jwtService = require('../services/jwt.service')
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

/**
 * Expire pupil's pin and set started check timestamp
 * @param token
 * @param checkCode
 */
pinService.expirePupilPin = async (token, checkCode) => {
  const decoded = jwtService.decode(token)
  const pupil = await pupilDataService.findOne({_id: ObjectId(decoded.sub)})
  const currentTimeStamp = moment.utc()
  await checkDataService.update({checkCode: checkCode}, { '$set': { checkStartedAt: currentTimeStamp } })
  if (!pupil.isTestAccount) {
    await pupilDataService.update(pupil._id, { pinExpiresAt: currentTimeStamp, pin: null })
  }
}

module.exports = pinService
