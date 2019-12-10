const moment = require('moment')

const R = require('ramda')
const pupilDataService = require('../services/data-access/pupil.data.service')
const checkDataService = require('../services/data-access/check.data.service')
const schoolDataService = require('../services/data-access/school.data.service')
const pupilIdentificationFlagService = require('../services/pupil-identification-flag.service')
const jwtService = require('../services/jwt.service')
const pinValidator = require('../lib/validator/pin-validator')
const pinService = {}

/**
 * Get pupils with active pins for a pin environment (live/fam)
 * @param schoolId
 * @param pinEnv
 * @returns {Promise<*>}
 */
pinService.getPupilsWithActivePins = async (schoolId, pinEnv) => {
  const pupils = await pupilDataService.sqlFindPupilsWithActivePins(schoolId, pinEnv)
  return pupilIdentificationFlagService.addIdentificationFlags(pupils)
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
  const pupil = await pupilDataService.sqlFindOneById(decoded.sub)
  // TODO should this use date service???
  const currentTimeStamp = moment.utc()
  await checkDataService.sqlUpdateCheckStartedAt(checkCode, currentTimeStamp)
  if (!pupil.isTestAccount) {
    pupil.pinExpiresAt = currentTimeStamp
    pupil.pin = null
    await pupilDataService.sqlUpdate(R.assoc('id', pupil.id, pupil))
  }
}

module.exports = pinService
