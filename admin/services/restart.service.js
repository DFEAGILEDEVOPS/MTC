const moment = require('moment')
const Promise = require('bluebird')
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
  pupils = await Promise.filter(pupils.map(async p => {
    const isPupilEligible = await restartService.isPupilEligible(p)
    if (isPupilEligible) return p
  }), p => !!p)
  if (pupils.length === 0) return []
  pupils = pupils.map(({ _id, pin, dob, foreName, middleNames, lastName }) =>
    ({ _id, pin, dob: dateService.formatShortGdsDate(dob), foreName, middleNames, lastName })
  )
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
  const canAllPupilsRestart = restartService.canAllPupilsRestart(pupilsList)
  if (!canAllPupilsRestart) {
    throw new Error(`One of the pupils is not eligible for a restart`)
  }
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
 * Checks if all selected pupils are eligible for restarts
 * @param pupilsList
 * @return {boolean}
 */
restartService.canAllPupilsRestart = async (pupilsList) => {
  const eligibilityList = await Promise.all(pupilsList.map(async pupilId => {
    const canRestart = await restartService.canRestart(pupilId)
    return { pupilId, canRestart: canRestart }
  }))
  return eligibilityList.every(e => e.canRestart)
}

/**
 * Compare completed checks and restarts counts to determine if pupil is allowed to have a restart
 * @param pupilId
 * @returns {boolean}
 */

restartService.canRestart = async pupilId => {
  const checkCount = await checkDataService.count({ pupilId: pupilId, checkStartedAt: { $ne: null } })
  const pupilRestartsCount = await pupilRestartDataService.count({ pupilId: pupilId, isDeleted: false })
  const hasRestartAttemptRemaining = pupilRestartsCount < restartService.totalRestartsAllowed
  const hasCheckAttemptRemaining = checkCount < restartService.totalChecksAllowed
  // i.e. If pupil has been given a restart on the very first time then:
  // The restart total count will be 1 and the check total count will be 1 as well
  // In order for the pupil to be visible on the restart eligibility list
  // the pupil must have completed the additional check ( 2 checks in total for this example)
  const hasUsedRestart = checkCount === pupilRestartsCount + 1
  return hasUsedRestart && hasRestartAttemptRemaining && hasCheckAttemptRemaining
}

/**
 * Get pupils who have been submitted for a restart
 * @param schoolId
 * @returns {Array}
 */

restartService.getSubmittedRestarts = async schoolId => {
  let pupils = await pupilDataService.getSortedPupils(schoolId, 'lastName', 'asc')
  if (!pupils || pupils.length === 0) return []
  let restarts = []
  // TODO: This loop is applied due to Cosmos MongoDB API bug and needs to be replaced with the new DB implementation
  await Promise.all(pupils.map(async p => {
    const r = await pupilRestartDataService.findOne({ pupilId: p._id, isDeleted: false })
    if (r) {
      const status = await restartService.getStatus(p._id)
      restarts.push({
        _id: r._id,
        reason: r.reason,
        status,
        foreName: p.foreName,
        lastName: p.lastName,
        middleNames: p.middleNames,
        dob: dateService.formatShortGdsDate(p.dob)
      })
    }
  }))
  restarts = pupilIdentificationFlagService.addIdentificationFlags(restarts)
  return restarts
}

/**
 * Get pupil's restart status
 * @param pupilId
 * @returns {String}
 */

restartService.getStatus = async pupilId => {
  const restartCodes = await pupilRestartDataService.getRestartCodes()
  const checkCount = await checkDataService.count({ pupilId: pupilId, checkStartedAt: { $ne: null } })
  const pupilRestartsCount = await pupilRestartDataService.count({ pupilId: pupilId, isDeleted: false })
  if (pupilRestartsCount === restartService.totalRestartsAllowed || checkCount === restartService.totalChecksAllowed)
    return restartCodes[2].status
  if (checkCount === pupilRestartsCount) return restartCodes[0].status
  if (checkCount === pupilRestartsCount + 1) return restartCodes[1].status
}

module.exports = restartService
