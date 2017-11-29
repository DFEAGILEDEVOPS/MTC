const moment = require('moment')
const pupilDataService = require('../services/data-access/pupil.data.service')
const schoolDataService = require('../services/data-access/school.data.service')
const pupilIdentificationFlagService = require('../services/pupil-identification-flag.service')
const pinValidator = require('../lib/validator/pin-validator')
const dateService = require('../services/date.service')

const restartService = {}

/**
 * Get pupils who are eligible for restart
 * @param schoolId
 * @returns {Array}
 */
restartService.getPupils = async (schoolId) => {
  const school = await schoolDataService.findOne({_id: schoolId})
  if (!school) throw new Error(`School [${schoolId}] not found`)
  let pupils = await pupilDataService.getSortedPupils(schoolId, 'lastName', 'asc')
  pupils = pupils
    .filter(p => restartService.isPupilEligible(p))
    .map(({ _id, pin, dob, foreName, middleNames, lastName }) =>
      ({ _id, pin, dob: () => dateService.formatLongGdsDate(dob), foreName, middleNames, lastName }))
  pupils = pupilIdentificationFlagService.addIdentificationFlags(pupils)
  return pupils
}

/**
 * Determine if pupil is eligible for restart
 * @param p
 * @returns {Boolean}
 */
restartService.isPupilEligible = (p) => {
  // This is undergoing changes as the count won't be attached to the pupil collection
  let restartCount = p.restartCount || 0
  if (restartCount >= 2 || p.attendanceCode) return false
  const hasExpiredToday = p.pinExpiresAt && moment(p.pinExpiresAt).isSame(moment.now(), 'day')
  return !pinValidator.isActivePin(p.pin, p.pinExpiresAt) && hasExpiredToday
}

module.exports = restartService
