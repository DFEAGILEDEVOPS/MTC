'use strict'

const School = require('../../models/school')

const schoolDataService = {}

schoolDataService.findOne = async function (options) {
  return School.findOne(options).lean().exec()
}

/**
 * Find Schools by criteria: e.g. schoolDataService.find({_id: '1234'})
 * @param criteria
 * @return {Promise.<void>} - lean School objects
 */
schoolDataService.find = async function (criteria) {
  return School.find(criteria).lean().exec()
}

/**
 * Update a single document
 * Example: `const res = await schoolDataService.update({_id: 9991999}, { $set: {name: 'Some Primary School'}})`
 * Example: `const res = await schoolDataService.update({_id: 9991999}, { _id: 9991999, name: 'Some Primary School', anotherProp: someVal, ...})`
 * @param {object} id  - the _id to match in the db
 * @param {object} doc - the update to run
 * @return {Promise<void>} - E.g. `{ n: 1, nModified: 1, ok: 1 }`
 */
schoolDataService.update = async function (id, doc) {
  return School.updateOne({ _id: id }, doc).exec()
}

module.exports = schoolDataService
