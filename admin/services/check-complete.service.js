'use strict'

const moment = require('moment')
const winston = require('winston')

const checkDataService = require('./data-access/check.data.service')
const completedCheckDataService = require('./data-access/completed-check.data.service')
const config = require('../config')
const jwtService = require('../services/jwt.service')
const markingService = require('./marking.service')
const psUtilService = require('./psychometrician-util.service')
const pupilDataService = require('../services/data-access/pupil.data.service')
const checkFormDataService = require('../services/data-access/check-form.data.service')
const monitor = require('../helpers/monitor')

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
  const receivedByServerAt = moment.utc()

  const existingCheck = await checkDataService.sqlFindOneByCheckCode(completedCheck.data.pupil.checkCode)
  if (!existingCheck.startedAt) {
    winston.debug('Check submission for a check that does not have a startedAt date')
    // determine the check started time from the audit log - CAUTION this is client data
    const startedAt = moment(psUtilService.getClientTimestampFromAuditEvent('CheckStarted', completedCheck))
    if (startedAt.isValid()) {
      await checkDataService.sqlUpdateCheckStartedAt(completedCheck.data.pupil.checkCode, startedAt)
    } else {
      winston.debug('StartedAt date is not valid')
    }
  }

  // store to data store
  await completedCheckDataService.sqlAddResult(completedCheck.data.pupil.checkCode, completedCheck, receivedByServerAt)

  if (config.autoMark) {
    // HACK temporary way to mark checks until we move to a dedicated scheduled process
    const check = await completedCheckDataService.sqlFindOneByCheckCode(completedCheck.data.pupil.checkCode)
    const checkForm = await checkFormDataService.sqlFindOneParsedById(check.checkForm_id)
    await markingService.mark({ ...check, formData: checkForm.formData })
  }
}

module.exports = monitor('check-complete.service', checkCompleteService)
