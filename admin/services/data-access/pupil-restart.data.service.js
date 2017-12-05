'use strict'

const PupilRestart = require('../../models/pupil-restart')
const RestartCode = require('../../models/restart-code')
const pupilRestartDataService = {}

/**
 * Create a new Pupil restart
 * @param data
 * @return {Promise}
 */
pupilRestartDataService.create = async function (data) {
  const pupilRestart = new PupilRestart(data)
  await pupilRestart.save()
  return pupilRestart.toObject()
}

/**
 * Find the count
 * @param query
 * @return {Promise.<*>}
 */
pupilRestartDataService.count = async function (query) {
  return PupilRestart.count(query).exec()
}

/**
 * Find and return a single restart by criteria in `options`
 * @param options
 * @return {Promise.<{Object}>}
 */
pupilRestartDataService.findOne = async function (options) {
  return PupilRestart.findOne(options).lean().exec()
}

/**
 * Get all the restart codes documents
 * @return {Promise.<{Object}>}
 */
pupilRestartDataService.getRestartCodes = async () => {
  return RestartCode
    .find()
    .sort('order')
}

module.exports = pupilRestartDataService
