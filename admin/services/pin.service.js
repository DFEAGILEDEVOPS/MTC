const moment = require('moment')
const R = require('ramda')
const pupilDataService = require('../services/data-access/pupil.data.service')
const checkDataService = require('../services/data-access/check.data.service')
const schoolDataService = require('../services/data-access/school.data.service')
const checkFormService = require('../services/check-form.service')
const checkWindowDataService = require('../services/data-access/check-window.data.service')
const pupilIdentificationFlagService = require('../services/pupil-identification-flag.service')
const jwtService = require('../services/jwt.service')
const dateService = require('../services/date.service')
const pinValidator = require('../lib/validator/pin-validator')
const pinsOverviewValidator = require('../lib/validator/pins-overview-validator')
const pinService = {}

/**
 * Get pupils with active pins
 * @param dfeNumber
 * @returns {Promise<*>}
 */
pinService.getPupilsWithActivePins = async (dfeNumber) => {
  let pupils = await pupilDataService.sqlFindPupilsWithActivePins(dfeNumber)
  pupils = pupils.map(p => {
    p.dateOfBirth = dateService.formatShortGdsDate(p.dateOfBirth)
    return p
  })
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

/**
 * Check and expire pupil pins based on set of provided pupil Ids
 * @param pupilIds
 * @returns {Promise}
 */

pinService.expireMultiplePins = async (pupilIds) => {
  const pupils = await pupilDataService.sqlFindByIds(pupilIds)
  let pupilData = []
  pupils.forEach(p => {
    if (p.pin || p.pinExpiresAt) pupilData.push(p)
  })
  if (pupilData.length === 0) return
  pupilData = pupilData.map(p => {
    p.pin = null
    p.pinExpiresAt = null
    return p
  })
  const data = pupilData.map(p => ({ id: p.id, pin: p.pin, pinExpiresAt: p.pinExpiresAt }))
  return pupilDataService.sqlUpdatePinsBatch(data)
}

/**
 * Detects possible check form and check window error that should prevent pin generation
 * @returns {String}
 */
pinService.getPinsOverviewError = async () => {
  const checkWindow = await checkWindowDataService.sqlFindOneCurrent()
  const allForms = await checkFormService.getAllFormsForCheckWindow(checkWindow && checkWindow.id)
  return pinsOverviewValidator.validate(checkWindow, allForms)
}

module.exports = pinService
