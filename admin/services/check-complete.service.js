'use strict'

const moment = require('moment')

const completedCheckDataService = require('./data-access/completed-check.data.service')
const checkDataService = require('./data-access/check.data.service')
const jwtService = require('../services/jwt.service')
const markingService = require('./marking.service')
const pupilDataService = require('../services/data-access/pupil.data.service')
const config = require('../config')

const checkCompleteService = {}

checkCompleteService.completeCheck = async function (completedCheck) {
  if (!(completedCheck && completedCheck.data)) {
    throw new Error('missing or invalid argument')
  }
  console.log('++++ completedCheck.data', completedCheck.data)
  const decoded = jwtService.decode(completedCheck.data['access_token'])
  console.log('++++ decoded', decoded)
  const pupilId = decoded.sub
  const pupil = await pupilDataService.sqlFindOneById(pupilId)
  // If pin expiration request failed previously ensure it is updated now
  if (pupil && pupil.pin && !pupil.isTestAccount) {
    await pupilDataService.sqlUpdate({ id: pupil.id, pinExpiresAt: moment.utc(), pin: null })
  }
  // Timestamp the request
  // TODO: This timestamp should be recorded in the application service tier instead
  completedCheck.receivedByServerAt = moment.utc()

  const existingCheck = await checkDataService.sqlFindOneByCheckCode(completedCheck.data.pupil.checkCode)
  if (!existingCheck.startedAt) {
    const startedAt_ = completedCheck.data.audit.filter(logEntry => (logEntry.type === 'QuestionRendered'))

    /*
    [
      {
        type: 'QuestionRendered',
        clientTimestamp: '2018-03-16T11:32:29.296Z',
        data: { practiseSequenceNumber: 1, question: '1x7' }
      },
      {
        type: 'QuestionRendered',
        clientTimestamp: '2018-03-16T11:32:33.014Z',
        data: { practiseSequenceNumber: 2, question: '3x10' }
      }
    ...
    ]
     */
    const startedAt__ = completedCheck.data.audit.filter(logEntry => {
      if (logEntry.type === 'QuestionRendered' && logEntry.data && logEntry.data.practiseSequenceNumber === 1) {
        return logEntry.data.clientTimestamp
      }
    })

    console.log('++++ (1)', startedAt_)
    console.log('++++ (2)', startedAt__)
    
    const startedAt = moment()
    await checkDataService.sqlUpdateCheckStartedAt(completedCheck.data.pupil.checkCode, startedAt)
  }
  existingCheck.startedAt = moment()
  // store to data store
  await completedCheckDataService.sqlAddResult(completedCheck.data.pupil.checkCode, completedCheck)

  if (config.autoMark) {
    // HACK temporary way to mark checks until we move to a dedicated scheduled process
    const check = await completedCheckDataService.sqlFindOneByCheckCode(completedCheck.data.pupil.checkCode)
    await markingService.mark(check)
  }
}

module.exports = checkCompleteService
