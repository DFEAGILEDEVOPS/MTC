const config = require('../config')
const logger = require('./log.service').getLogger()
const prepareCheckService = require('./prepare-check.service')
const pupilDataService = require('../services/data-access/pupil.data.service')
const pupilRestartDataService = require('../services/data-access/pupil-restart.data.service')
const restartDataService = require('./data-access/restart-v2.data.service')
const setValidationService = require('./set-validation.service')
const { PupilFrozenService } = require('./pupil-frozen/pupil-frozen.service')
const R = require('ramda')
const pupilIdentificationFlagService = require('../services/pupil-identification-flag.service')

const restartService = {}

restartService.totalRestartsAllowed = config.RESTART_MAX_ATTEMPTS
restartService.totalChecksAllowed = restartService.totalRestartsAllowed + 1

/**
 * Get restart reasons
 * @returns {Promise<Array>}
 */
restartService.getReasons = async () => {
  return pupilRestartDataService.sqlFindRestartReasons()
}

/**
 * Perform restart for a list of pupils
 * @param {number[]} pupilsList
 * @param restartReasonCode
 * @param didNotCompleteInfo
 * @param restartFurtherInfo
 * @param userName
 * @param {Number} schoolId - `school.id` database ID
 * @returns {Promise.<any>}
 */
restartService.restart = async (
  pupilsList,
  restartReasonCode,
  didNotCompleteInfo,
  restartFurtherInfo,
  userName,
  schoolId) => {
  if (!schoolId) {
    throw new Error('Missing parameter: `schoolId`')
  }
  // All pupils should be eligible for restart before proceeding with creating a restart record for each one
  // validation throws if it fails to validate
  await restartService.validateIncomingPupils(schoolId, pupilsList)

  // By assembling the restart data in a hash, duplicates IDs in the `pupilsList` will be folded into one,
  // and it makes it easier later on to add the `currentCheckId` property.
  const restartData = {}
  pupilsList.forEach(pupilId => {
    restartData[pupilId] = {
      pupil_id: pupilId,
      recordedByUser_id: userName,
      pupilRestartReasonCode: restartReasonCode,
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
  await prepareCheckService.dropChecksFromCache(checkIds)
  // do all the database work
  const pupilData = await restartDataService.restartTransactionForPupils(Object.values(restartData))
  return pupilData.map(p => { return { urlSlug: p.urlSlug } })
}

/**
 * Mark as deleted the latest pupil's restart
 * @param {string} pupilUrlSlug - the unique pupil uuid
 * @param {number} userId - id of user deleting restart
 * @param {number} schoolId - school id of teacher deleting restart
 * @returns {Promise<Object>} - the pupil obj
 */
restartService.markDeleted = async (pupilUrlSlug, userId, schoolId) => {
  const pupil = await pupilDataService.sqlFindOneBySlug(pupilUrlSlug, schoolId)

  if (!pupil) {
    throw new Error('pupil not found')
  }

  await PupilFrozenService.throwIfFrozenByIds([pupil.id])

  // Ideally the slug would refer to the restart itself and not the pupil.
  const restart = await pupilRestartDataService.sqlFindOpenRestartForPupil(pupilUrlSlug, schoolId)

  if (!restart) {
    throw new Error('No restarts found to remove')
  }

  await pupilRestartDataService.sqlMarkRestartAsDeleted(restart.id, userId)

  // If the above was successful we can remove any prepared checks in Redis that may exist.
  if (restart.check_id) {
    await prepareCheckService.dropChecksFromCache([restart.check_id])
  }

  return pupil
}

/**
 *
 * @param {Number} schoolId
 * @param {Array<Number | String>} pupilIds
 * @return {Promise<void>}
 */
restartService.validateIncomingPupils = async (schoolId, pupilIds) => {
  const dbPupils = await restartDataService.sqlFindPupilsEligibleForRestartByPupilId(schoolId, pupilIds)
  const difference = setValidationService.validate(
    // @ts-ignore data could be number or string
    pupilIds.map(x => parseInt(x, 10)), // convert incoming strings '99' to numbers 99
    dbPupils // must have an 'id' field to check against
  )

  if (difference.size > 0) {
    logger.error(`restartService.validateIncomingPupils: incoming pupiIds [${pupilIds.join(', ')}] not found for school ID [${schoolId}]: [${Array.from(difference).join(', ')}]`)
    throw new Error('One of the pupils is not eligible for a restart')
  }
}

/**
 * Find restart for a particular school
 * @param schoolId
 * @returns {Promise<import('../services/pupil-identification-flag.service').IdentifiedPupil[]>}
 */
restartService.getRestartsForSchool = async function getRestartsForSchool (schoolId) {
  const restarts = await restartDataService.getRestartsForSchool(schoolId)
  const restartsWithStatus = restarts.map(r => {
    const update = {
      totalCheckCount: R.isNil(r.totalCheckCount) ? 0 : r.totalCheckCount,
      status: ''
    }

    // if all restarts used and no discretionary restart available...
    if ((r.totalCheckCount >= config.RESTART_MAX_ATTEMPTS + 1) && !r.isDiscretionaryRestartAvailable) {
      update.status = 'Maximum number of restarts taken'
      // if a pin has been generated against the restart...
    } else if (r.restartCheckId !== null) {
      update.status = 'Restart taken'
    // if discretionary restart available or else pupil has logged in to the restart check...
    } else if (r.isDiscretionaryRestartAvailable) {
      update.status = 'Restart taken'
    // if no check generated against restart or else restart check not received and restart check not marked as complete
    } else if (r.restartCheckId === null || (r.restartCheckReceived === false && r.restartCheckComplete === false)) {
      update.status = 'Remove restart'
    } else {
      update.status = 'Restart taken'
    }
    return R.mergeLeft(update, r)
  })
  return pupilIdentificationFlagService.sortAndAddIdentificationFlags(restartsWithStatus)
}

/**
 * Find pupils who are eligible for a restart
 * @param {number} schoolId
 * @return {Promise<*>}
 */
restartService.getPupilsEligibleForRestart = async function getPupilsEligibleForRestart (schoolId) {
  const pupils = await restartDataService.sqlFindPupilsEligibleForRestart(schoolId)
  // Fix up the pupil names for the GUI
  return pupilIdentificationFlagService.sortAndAddIdentificationFlags(pupils)
}

module.exports = restartService
