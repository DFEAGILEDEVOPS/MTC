'use strict'

const PupilRestart = require('../../models/pupil-restart')
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

module.exports = pupilRestartDataService
