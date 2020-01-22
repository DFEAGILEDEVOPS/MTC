const bluebird = require('bluebird')
const R = require('ramda')

const checkDataService = require('../services/data-access/check.data.service')
const config = require('../config')
const prepareCheckService = require('./prepare-check.service')
const pupilDataService = require('../services/data-access/pupil.data.service')
const pupilIdentificationFlagService = require('../services/pupil-identification-flag.service')
const pupilRestartDataService = require('../services/data-access/pupil-restart.data.service')
const restartDataService = require('./data-access/restart-v2.data.service')

const restartService = {}

restartService.totalRestartsAllowed = config.RESTART_MAX_ATTEMPTS
restartService.totalChecksAllowed = restartService.totalRestartsAllowed + 1

/**
 * Get restart reasons
 * @returns {Array}
 */
restartService.getReasons = async () => {
  return pupilRestartDataService.sqlFindRestartReasons()
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
  // TODO: validate incoming pupils are eligible for restart.

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

  // delete any remaining Prepared Checks to prevent pupils using these checks
  const checkIds = checkData.map(c => c.checkId)
  await prepareCheckService.removeChecks(checkIds)
  // do all the database work
  const pupilData = await restartDataService.restartTransactionForPupils(Object.values(restartData))
  return pupilData.map(p => { return { urlSlug: p.urlSlug } })
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
 * @returns {Object} - the pupil obj
 */
restartService.markDeleted = async (pupilUrlSlug, userId, schoolId) => {
  const pupil = await pupilDataService.sqlFindOneBySlug(pupilUrlSlug, schoolId)

  if (!pupil) {
    throw new Error('pupil not found')
  }

  // Ideally the slug would refer to the restart itself and not the pupil.
  const restart = await pupilRestartDataService.sqlFindOpenRestartForPupil(pupilUrlSlug, schoolId)

  if (!restart) {
    throw new Error('No restarts found to remove')
  }

  await pupilRestartDataService.sqlMarkRestartAsDeleted(restart.id, userId)

  // If the above was successful we can remove any prepared checks in Redis that may exist.
  if (restart.check_id) {
    await prepareCheckService.removeChecks([restart.check_id])
  }

  return pupil
}

module.exports = restartService
