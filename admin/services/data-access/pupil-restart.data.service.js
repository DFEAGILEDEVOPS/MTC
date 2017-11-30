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
  return pupilRestart.save()
}

/**
 * Find the count
 * @param query
 * @return {Promise.<*>}
 */
pupilRestartDataService.count = async function (query) {
  return PupilRestart.count(query).exec()
}

module.exports = pupilRestartDataService
