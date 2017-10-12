'use strict'

const completedCheckDataService = {}
const mongoService = require('./mongo.service')
/**
 * Create a new Check
 * @param data
 * @return {Promise}
 */
completedCheckDataService.create = async function (data) {
  const mongo = mongoService.get()
  const checks = mongo.collection('completedchecks')
  console.log('inserting:', data)
  await checks.insert(data)
}

module.exports = completedCheckDataService
