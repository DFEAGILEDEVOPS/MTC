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
    .filter(p => pinValidator.isActivePin(p.pin, p.pinExpiresAt))
    .map(({ _id, pin, dob, foreName, middleNames, lastName }) =>
      ({ _id, pin, dob: moment(dob).format('DD MMM YYYY'), foreName, middleNames, lastName }))
  pupils = pupilIdentificationFlagService.addIdentificationFlags(pupils)
  return pupils
}

/**
 * Get active school Password
 * @param {number} dfeNumber
 * @returns {String}
 */
pinService.getActiveSchool = async (dfeNumber) => {
  const school = await schoolDataService.sqlFindOneByDfeNumber(dfeNumber)
  if (!pinValidator.isActivePin(school.pin, school.pinExpiresAt)) {
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
  // TODO should this use date service???
  const currentTimeStamp = moment.utc()
  await checkDataService.sqlUpdateCheckStartedAt(checkCode, currentTimeStamp)
  if (!pupil.isTestAccount) {
    await pupilDataService.update({_id: pupil._id}, { pinExpiresAt: currentTimeStamp, pin: null })
  }
}

/**
 * Check and expire pupil pins based on set of provided pupil Ids
 * @param pupilIds
 * @returns {Promise}
 */

pinService.expireMultiplePins = async (pupilIds) => {
  let pupils = []
  for (let index = 0; index < pupilIds.length; index++) {
    const id = pupilIds[ index ]
    const pupil = await pupilDataService.findOne({_id: ObjectId(id)})
    if (pupil.pin || pupil.pinExpiresAt) pupils.push(pupil)
  }
  if (pupils.length === 0) return
  pupils = pupils.map(p => {
    p.pin = null
    p.pinExpiresAt = null
    return p
  })
  return pupilDataService.updateMultiple(pupils)
}

module.exports = pinService
