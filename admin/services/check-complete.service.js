'use strict'

const moment = require('moment')

const completedCheckDataService = require('./data-access/completed-check.data.service')
const jwtService = require('../services/jwt.service')
const markingService = require('./marking.service')
const pupilDataService = require('../services/data-access/pupil.data.service')

const checkCompleteService = {}

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
  // TODO: This timestamp should be recorded in the application service tier instead
  completedCheck.receivedByServerAt = moment.utc()

  // store to data store
  await completedCheckDataService.sqlAddResult(completedCheck.data.pupil.checkCode, completedCheck)

  // HACK temporary way to mark checks until we move to a dedicated scheduled process
  const check = await completedCheckDataService.sqlFindOneByCheckCode(completedCheck.data.pupil.checkCode)
  await markingService.mark(check)
}

module.exports = checkCompleteService
