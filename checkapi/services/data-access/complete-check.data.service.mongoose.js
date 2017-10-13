'use strict'

const completedCheckDataService = {}
const CompletedCheck = require('./completed-check-dto')

/**
 * Create a new Check
 * @param data
 * @return {Promise}
 */
completedCheckDataService.create = async function (data) {
  const completedCheck = new CompletedCheck(data)
  await completedCheck.save()
  return completedCheck
}

module.exports = completedCheckDataService
