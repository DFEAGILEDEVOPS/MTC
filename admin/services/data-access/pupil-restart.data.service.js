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
 * Update a Pupil's restart
 * @param query
 * @param criteria
 * @return {Promise}
 */
pupilRestartDataService.update = async function (query, criteria) {
  return PupilRestart.updateOne(query, criteria).exec()
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
 * Find and return the latest single restart by criteria in `options`
 * @param options
 * @return {Promise.<{Object}>}
 */
pupilRestartDataService.findLatest = async function (options) {
  const latest = await PupilRestart.find(options).sort({ $natural: -1 }).limit(1).lean().exec()
  return latest[0]
}

/**
 * Get all the restart codes documents
 * @return {Promise.<{Object}>}
 */
pupilRestartDataService.getRestartCodes = async () => {
  return RestartCode.find().lean().exec()
}

module.exports = pupilRestartDataService
