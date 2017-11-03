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

schoolDataService.update = async function (id, doc) {
  return new Promise((resolve, reject) => {
    School.updateOne({ _id: id }, doc, (error) => {
      if (error) { return reject(error) }
      resolve(null)
    })
  })
}

module.exports = schoolDataService
