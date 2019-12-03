const moment = require('moment')
const bluebird = require('bluebird')
const R = require('ramda')

const azureQueueService = require('../services/azure-queue.service')
const checkDataService = require('../services/data-access/check.data.service')
const config = require('../config')
const featureToggles = require('feature-toggles')
const logger = require('./log.service').getLogger()
const pinValidator = require('../lib/validator/pin-validator')
const pupilDataService = require('../services/data-access/pupil.data.service')
const pupilIdentificationFlagService = require('../services/pupil-identification-flag.service')
const pupilRestartDataService = require('../services/data-access/pupil-restart.data.service')
const pupilStatusService = require('../services/pupil.status.service')
const restartDataService = require('./data-access/restart-v2.data.service')
const schoolDataService = require('../services/data-access/school.data.service')

const restartService = {}

restartService.totalRestartsAllowed = config.RESTART_MAX_ATTEMPTS
restartService.totalChecksAllowed = restartService.totalRestartsAllowed + 1

/**
 * Get pupils who are eligible for restart
 * @param schoolId
 * @returns {Array}
 */
restartService.getPupils = async (schoolId) => {
  const school = await schoolDataService.sqlFindOneById(schoolId)
  if (!school) throw new Error(`School [${schoolId}] not found`)
  let pupils = await pupilDataService.sqlFindPupilsBySchoolId(schoolId)
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
 * @param {number[]} pupilsList
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
  // All pupils should be eligible for restart before proceeding with creating a restart record for each one
  const canAllPupilsRestart = restartService.canAllPupilsRestart(pupilsList)
  if (!canAllPupilsRestart) {
    throw new Error('One of the pupils is not eligible for a restart')
  }

  // By assembling the restart data in a hash, duplicates IDs in the `pupilsList` will be folded into one,
  // and it makes it easier later on to add the `currentCheckId` property.
  const restartData = {}
  pupilsList.forEach(pupilId => {
    restartData[pupilId] = {
      pupil_id: pupilId,
      recordedByUser_id: userName,
      pupilRestartReasonCode: restartReasonCode,
      classDisruptionInformation: classDisruptionInfo,
      didNotCompleteInformation: didNotCompleteInfo,
      furtherInformation: restartFurtherInfo
    }
  })
  const checkData = await restartDataService.getLiveCheckDataByPupilId(pupilsList)
  // Add the current check id into the restart data, so we can pass it into the data service
  checkData.forEach(check => {
    if (check.checkId) {
      restartData[check.pupilId].currentCheckId = check.checkId
    }
  })

  // todo: delete Prepared Check

  const pupilData = await restartDataService.restartTransactionForPupils(Object.values(restartData))

  // Ask for the pupils to have their status updated
  try {
    logger.debug('Pupil status recalc dispatched for ', pupilsList)
    await pupilStatusService.recalculateStatusByPupilIds(pupilsList, schoolId)
  } catch (error) {
    logger.error('restartService.markDeleted(): Failed to recalculate pupil status', error)
    throw error
  }

  return pupilData.map(p => { return { urlSlug: p.urlSlug } })
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
  const pupils = await pupilDataService.sqlFindPupilsBySchoolId(schoolId)
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
        dateOfBirth: p.dateOfBirth,
        urlSlug: p.urlSlug
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
restartService.markDeleted = async (pupilUrlSlug, userId, schoolId) => {
  const pupil = await pupilDataService.sqlFindOneBySlug(pupilUrlSlug, schoolId)

  if (!pupil) {
    throw new Error('pupil not found')
  }

  const restart = await pupilRestartDataService.sqlFindOpenRestartForPupil(pupilUrlSlug, schoolId)

  if (!restart) {
    throw new Error('No restarts found to remove')
  }

  // see if there is a check associated with this restart, ideally the slug
  // would refer to the restart itself, and not the pupil.
  if (restart.check_id) {
    if (featureToggles.isFeatureEnabled('prepareChecksInRedis')) {
      // remove redis check
    } else {
      const check = await pupilRestartDataService.sqlFindCheckById(restart.check_id, schoolId)
      azureQueueService.addMessage('prepared-check-delete', {
        version: 1,
        checkCode: check.checkCode,
        reason: 'restart deleted',
        actionedByUserId: userId
      })
    }
  }

  await pupilRestartDataService.sqlMarkRestartAsDeleted(restart.id, userId)

  // Ask for the pupil to have their status updated
  try {
    await pupilStatusService.recalculateStatusByPupilIds([pupil.id], schoolId)
  } catch (error) {
    logger.error('restartService.markDeleted(): Failed to recalculate pupil status', error)
    throw error
  }

  return pupil
}

module.exports = restartService
