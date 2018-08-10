const moment = require('moment')
const bluebird = require('bluebird')
const R = require('ramda')
const pupilDataService = require('../services/data-access/pupil.data.service')
const schoolDataService = require('../services/data-access/school.data.service')
const checkDataService = require('../services/data-access/check.data.service')
const pupilRestartDataService = require('../services/data-access/pupil-restart.data.service')
const pupilIdentificationFlagService = require('../services/pupil-identification-flag.service')
const pinService = require('../services/pin.service')
const pinValidator = require('../lib/validator/pin-validator')
const config = require('../config')
const monitor = require('../helpers/monitor')

const restartService = {}

restartService.totalRestartsAllowed = config.RESTART_MAX_ATTEMPTS
restartService.totalChecksAllowed = restartService.totalRestartsAllowed + 1

/**
 * Get pupils who are eligible for restart
 * @param dfeNumber
 * @returns {Array}
 */
restartService.getPupils = async (dfeNumber) => {
  const school = await schoolDataService.sqlFindOneByDfeNumber(dfeNumber)
  if (!school) throw new Error(`School [${dfeNumber}] not found`)
  let pupils = await pupilDataService.sqlFindPupilsByDfeNumber(dfeNumber, 'lastName', 'asc')
  pupils = pupilIdentificationFlagService.addIdentificationFlags(pupils)
  pupils = await bluebird.filter(pupils.map(async p => {
    const isPupilEligible = await restartService.isPupilEligible(p)
    if (isPupilEligible) return p
  }), p => !!p)
  return pupils
}

/**
 * Get restart reasons
 * @returns {Array}
 */
restartService.getReasons = async () => {
  return pupilRestartDataService.sqlFindRestartReasons()
}

/**
 * Determine all the factors that make pupil eligible for a restart
 * @param p
 * @returns {boolean}
 */
restartService.isPupilEligible = async (p) => {
  const canRestart = await restartService.canRestart(p.id)
  if (p.attendanceCode || !canRestart) return false
  const hasExpiredToday = p.pinExpiresAt && moment(p.pinExpiresAt).isSame(moment.now(), 'day')
  return !pinValidator.isActivePin(p.pin, p.pinExpiresAt) && hasExpiredToday
}

/**
 * Perform restart for a list of pupils
 * @param pupilsList
 * @param restartReasonCode
 * @param didNotCompleteInfo
 * @param classDisruptionInfo
 * @param restartFurtherInfo
 * @param userName
 * @param {Number} schoolId - `school.id` database ID
 * @returns {Promise.<void>}
 */

restartService.restart = async (
  pupilsList,
  restartReasonCode,
  classDisruptionInfo,
  didNotCompleteInfo,
  restartFurtherInfo,
  userName,
  schoolId) => {
  if (!schoolId) {
    throw new Error('Missing parameter: `schoolId`')
  }
  await pinService.expireMultiplePins(pupilsList, schoolId)
  // All pupils should be eligible for restart before proceeding with creating a restart record for each one
  const canAllPupilsRestart = restartService.canAllPupilsRestart(pupilsList)
  if (!canAllPupilsRestart) {
    throw new Error(`One of the pupils is not eligible for a restart`)
  }
  const restartReasonId = await pupilRestartDataService.sqlFindRestartReasonByCode(restartReasonCode)
  return Promise.all(pupilsList.map(async pupilId => {
    const pupilRestartData = {
      pupil_id: pupilId,
      recordedByUser_id: userName,
      pupilRestartReason_id: restartReasonId,
      classDisruptionInformation: classDisruptionInfo,
      didNotCompleteInformation: didNotCompleteInfo,
      furtherInformation: restartFurtherInfo,
      createdAt: moment.utc()
    }
    return pupilRestartDataService.sqlCreate(pupilRestartData)
  }))
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
  const checkCount = await checkDataService.sqlFindNumberOfChecksStartedByPupil(pupilId)
  const pupilRestartsCount = await pupilRestartDataService.sqlGetNumberOfRestartsByPupil(pupilId)
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
  let pupils = await pupilDataService.sqlFindPupilsByDfeNumber(schoolId, 'lastName', 'asc')
  if (!pupils || pupils.length === 0) return []
  let restarts = []
  // TODO: This loop is applied due to Cosmos MongoDB API bug and needs to be replaced with the new DB implementation
  const latestPupilRestarts = await bluebird.filter(pupils.map(async p => {
    const restart = await pupilRestartDataService.sqlFindLatestRestart(p.id)
    if (restart) {
      const status = await restartService.getStatus(p.id)
      return { ...restart, status }
    }
  }), p => !!p)
  await Promise.all(pupils.map(async p => {
    const record = latestPupilRestarts.find(l => l.pupil_id === p.id)
    if (record) {
      const reason = await pupilRestartDataService.sqlFindRestartReasonDescById(record.pupilRestartReason_id)
      restarts.push({
        id: record.id,
        pupilId: p.id,
        reason: reason,
        status: record.status,
        foreName: p.foreName,
        lastName: p.lastName,
        middleNames: p.middleNames,
        dateOfBirth: p.dateOfBirth
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
  const restartCodes = await pupilRestartDataService.sqlFindRestartCodes()
  const getStatus = (value) => {
    const entry = restartCodes && R.find(c => c.code === value)(restartCodes)
    return entry && entry.description
  }
  const checkCount = await checkDataService.sqlFindNumberOfChecksStartedByPupil(pupilId)
  const pupilRestartsCount = await pupilRestartDataService.sqlGetNumberOfRestartsByPupil(pupilId)
  if (checkCount === restartService.totalChecksAllowed) return getStatus('MAX')
  if (checkCount === pupilRestartsCount) return getStatus('REM')
  if (checkCount === pupilRestartsCount + 1) return getStatus('TKN')
}

/**
 * Mark as deleted the latest pupil's restart
 * @param pupilId
 * @param userId
 * @returns {String}
 */

restartService.markDeleted = async (pupilId, userId) => {
  // TODO: add security to restrict it to the user's school
  const pupil = await pupilDataService.sqlFindOneById(pupilId)
  let lastStartedCheck = await checkDataService.sqlFindLastStartedCheckByPupilId(pupilId)
  pupil.pinExpiresAt = lastStartedCheck.startedAt
  await pupilDataService.sqlUpdate(R.assoc('id', pupil.id, pupil))
  await pupilRestartDataService.sqlMarkRestartAsDeleted(pupilId, userId)
  return pupil
}

module.exports = monitor('restart.service', restartService)
