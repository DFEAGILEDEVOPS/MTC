'use strict'

const moment = require('moment')

const checkStateService = require('../services/check-state.service')
const completedCheckDataService = require('./data-access/completed-check.data.service')
const jwtService = require('../services/jwt.service')
const pupilDataService = require('../services/data-access/pupil.data.service')

const checkCompleteService = {}

/**
 * @deprecated - this has now moved to a Serverless Function
 * @param completedCheck
 * @return {Promise<void>}
 */
checkCompleteService.completeCheck = async function (completedCheck) {
  if (!(completedCheck && completedCheck.data)) {
    throw new Error('missing or invalid argument')
  }
  const decoded = jwtService.decode(completedCheck.data['access_token'])
  const pupilId = decoded.sub
  const pupil = await pupilDataService.sqlFindOneById(pupilId)
  // If pin expiration request failed previously ensure it is updated now
  if (pupil && pupil.pin && !pupil.isTestAccount) {
    await pupilDataService.sqlUpdate({ id: pupil.id, pinExpiresAt: moment.utc(), pin: null })
  }
  // Timestamp the request
  const receivedByServerAt = moment.utc()

  // const existingCheck = await checkDataService.sqlFindOneByCheckCode(completedCheck.data.pupil.checkCode)
  // if (!existingCheck.startedAt) {
  //   logger.debug('Check submission for a check that does not have a startedAt date')
  //   // determine the check started time from the audit log - CAUTION this is client data
  //   const startedAt = moment(psUtilService.getClientTimestampFromAuditEvent('CheckStarted', completedCheck))
  //   if (startedAt.isValid()) {
  //     await checkDataService.sqlUpdateCheckStartedAt(completedCheck.data.pupil.checkCode, startedAt)
  //   } else {
  //     logger.debug('StartedAt date is not valid')
  //   }
  // }

  // store to data store
  await completedCheckDataService.sqlAddResult(completedCheck.data.pupil.checkCode, completedCheck, receivedByServerAt)

  // Update the check status to complete
  await checkStateService.changeState(completedCheck.data.pupil.checkCode, checkStateService.States.Complete)
}

module.exports = checkCompleteService
