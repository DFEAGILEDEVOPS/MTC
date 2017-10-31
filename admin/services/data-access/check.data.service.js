'use strict'

const Check = require('../../models/check')
const checkDataService = {}

/**
 * Find a Check and return the lean model
 * @param checkCode
 * @return {Promise}
 */
checkDataService.findOneByCheckCode = async function (checkCode) {
  return Check.findOne({checkCode}).lean().exec()
}

/**
 * Find Checks by criteria: e.g. checkDataService.find({checkWindowId: 1234})
 * @param criteria
 * @return {Promise.<void>} - lean Check objects
 */
checkDataService.find = async function (criteria) {
  return Check.find(criteria).lean().exec()
}

/**
 * Find Checks by criteria: e.g. checkDataService.find({checkWindowId: 1234})
 * @param criteria
 * @return {Promise.<void>} - lean Check objects
 */
checkDataService.findLatestCheckByPupilId = async function (pupilId) {
  return Check.findOne({ pupilId: pupilId }).sort({ field: 'asc', _id: -1 }).limit(1).lean().exec()
}

/**
 * Find the count
 * @param query
 * @return {Promise.<*>}
 */
checkDataService.count = async function (query) {
  return Check.count(query).exec()
}

/**
 * Generalised update function - use with care
 * @param query
 * @param criteria
 * @return {Promise}
 */
checkDataService.update = async function (query, criteria) {
  return new Promise((resolve, reject) => {
    Check.updateOne(query, criteria, (error) => {
      if (error) { return reject(error) }
      resolve(null)
    })
  })
}

module.exports = checkDataService
