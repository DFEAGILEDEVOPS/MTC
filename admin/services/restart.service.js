const config = require('../config')
const logger = require('./log.service').getLogger()
const prepareCheckService = require('./prepare-check.service')
const pupilDataService = require('../services/data-access/pupil.data.service')
const pupilRestartDataService = require('../services/data-access/pupil-restart.data.service')
const restartDataService = require('./data-access/restart-v2.data.service')
const setValidationService = require('./set-validation.service')
const { PupilFrozenService } = require('./pupil-frozen.service/pupil-frozen.service')

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
 * @param classDisruptionInfo
 * @param restartFurtherInfo
 * @param userName
 * @param {Number} schoolId - `school.id` database ID
 * @returns {Promise.<any>}
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

module.exports = restartService
