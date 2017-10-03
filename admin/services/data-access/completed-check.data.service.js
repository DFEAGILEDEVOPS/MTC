'use strict'

const CompletedChecks = require('../../models/completed-checks')
const completedCheckDataService = {}

/**
 * Create a new Check
 * @param data
 * @return {Promise}
 */
completedCheckDataService.create = async function (data) {
  const completedCheck = new CompletedChecks(data)
  await completedCheck.save()
  return completedCheck
}

module.exports = completedCheckDataService
