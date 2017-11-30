const moment = require('moment')
const pupilDataService = require('../services/data-access/pupil.data.service')
const schoolDataService = require('../services/data-access/school.data.service')
const checkDataService = require('../services/data-access/check.data.service')
const pupilRestartDataService = require('../services/data-access/pupil-restart.data.service')
const pupilIdentificationFlagService = require('../services/pupil-identification-flag.service')
const pinService = require('../services/pin.service')
const pinValidator = require('../lib/validator/pin-validator')
const dateService = require('../services/date.service')
const config = require('../config')

const restartService = {}

restartService.totalRestartsAllowed = config.RESTART_MAX_ATTEMPTS
restartService.totalChecksAllowed = restartService.totalRestartsAllowed + 1

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
    .filter(async p => restartService.isPupilEligible(p))
    .map(({ _id, pin, dob, foreName, middleNames, lastName }) =>
      ({ _id, pin, dob: () => dateService.formatLongGdsDate(dob), foreName, middleNames, lastName }))
  pupils = pupilIdentificationFlagService.addIdentificationFlags(pupils)
  return pupils
}

/**
 * Determine all the factors that make pupil eligible for a restart
 * @param p
 * @returns {boolean}
 */
restartService.isPupilEligible = async (p) => {
  const canRestart = await restartService.canRestart(p._id)
  if (p.attendanceCode || !canRestart) return false
  const hasExpiredToday = p.pinExpiresAt && moment(p.pinExpiresAt).isSame(moment.now(), 'day')
  return !pinValidator.isActivePin(p.pin, p.pinExpiresAt) && hasExpiredToday
}

/**
 * Perform restart for a list of pupils
 * @param pupilsList
 * @param restartReason
 * @param didNotCompleteInfo
 * @param restartFurtherInfo
 * @param userId
 * @returns {Promise.<void>}
 */

restartService.restart = async (pupilsList, restartReason, didNotCompleteInfo, restartFurtherInfo, userName) => {
  await pinService.expireMultiplePins(pupilsList)
  // All pupils should be eligible for restart before proceeding with creating a restart record for each one
  const eligibilityList = await Promise.all(pupilsList.map(async pupilId => {
    const canRestart = await restartService.canRestart(pupilId)
    if (!canRestart) return { pupilId, notEligible: true }
    return { pupilId }
  }))
  eligibilityList.forEach(e => {
    if (e.notEligible) throw new Error(`Pupil ${e.pupilId} is not eligible for a restart`)
  })
  const submitted = await Promise.all(pupilsList.map(async pupilId => {
    const pupilRestartData = {
      pupilId,
      recordedByUser: userName,
      reason: restartReason,
      didNotCompleteInformation: didNotCompleteInfo,
      furtherInformation: restartFurtherInfo,
      createdAt: moment.utc()
    }
    return pupilRestartDataService.create(pupilRestartData)
  }))
  return submitted
}

/**
 * Compare completed checks and restarts counts to determine if pupil is allowed to have a restart
 * @param pupilId
 * @returns {boolean}
 */

restartService.canRestart = async pupilId => {
  const checkCount = await checkDataService.count({ pupilId: pupilId, checkStartedAt: { $ne: null } })
  const pupilRestartsCount = await pupilRestartDataService.count({ pupil: pupilId, isDeleted: false })
  const hasRestartAttemptRemaining = pupilRestartsCount < restartService.totalRestartsAllowed
  const hasCheckAttemptRemaining = checkCount < restartService.totalChecksAllowed
  // i.e. If pupil has been given a restart on the very first time then:
  // The restart total count will be 1 and the check total count will be 1 as well
  // In order for the pupil to be visible on the restart eligibility list
  // the pupil must have completed the additional check ( 2 checks in total for this example)
  const hasUsedRestart = checkCount === pupilRestartsCount + 1
  return hasUsedRestart && hasRestartAttemptRemaining && hasCheckAttemptRemaining
}

module.exports = restartService
