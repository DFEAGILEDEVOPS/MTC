'ust strict'

const School = require('../../models/school')

const schoolDataService = {}

schoolDataService.findOne = async function (options) {
  const s = await School.findOne(options).lean().exec()
  return s
}

/**
 * Find Schools by criteria: e.g. schoolDataService.find({_id: '1234'})
 * @param criteria
 * @return {Promise.<void>} - lean School objects
 */
schoolDataService.find = async function (criteria) {
  return School.find(criteria).lean().exec()
}

module.exports = schoolDataService
