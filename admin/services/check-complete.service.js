'use strict'

const moment = require('moment')
const ObjectId = require('mongoose').Types.ObjectId
const completedCheckDataService = require('./data-access/completed-check.data.service')
const pupilDataService = require('../services/data-access/pupil.data.service')
const jwtService = require('../services/jwt.service')
const markingService = require('./marking.service')

const checkCompleteService = {}

checkCompleteService.completeCheck = async function (completedCheck) {
  if (!(completedCheck && completedCheck.data)) {
    throw new Error('missing or invalid argument')
  }
  const decoded = jwtService.decode(completedCheck.data['access_token'])
  const pupil = await pupilDataService.findOne({_id: ObjectId(decoded.sub)})
  // If pin expiration request failed previously ensure it is updated now
  if (pupil && pupil.pin && !pupil.isTestAccount) {
    await pupilDataService.update({_id: pupil._id}, { pinExpiresAt: moment.utc(), pin: null })
  }
  // Timestamp the request
  completedCheck.receivedByServerAt = moment.utc()

  // store to data store
  await completedCheckDataService.sqlAddResult(completedCheck)
  // temporary way to mark checks until we move to a dedicated scheduled process
  await markingService.mark(completedCheck)
}

module.exports = checkCompleteService
