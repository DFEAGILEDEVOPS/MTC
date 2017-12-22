'use strict'

const Check = require('../../models/check')
const sqlService = require('./sql.service')
const TYPES = require('tedious').TYPES

const checkDataService = {}

/**
 * Find a Check and return the lean model
 * @param checkCode
 * @return {Promise}
 */
checkDataService.sqlFindOneByCheckCode = async function (checkCode) {
  return Check.findOne({checkCode}).lean().exec()
}

/**
 * Find a Check by its checkCode UUID
 * @param checkCode
 * @return {Promise}
 */
checkDataService.sqlFindOneByCheckCode = async function (checkCode) {
  const params = [
    {
      name: 'checkCode',
      value: checkCode,
      type: TYPES.UniqueIdentifier
    }
  ]
  return sqlService.query('SELECT * FROM [mtc_admin].[check] WHERE checkCode=@checkCode', params)
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
 * Find latest checks by criteria: e.g. checkDataService.findOne({checkWindowId: 1234})
 * @param criteria
 * @return {Promise.<void>} - lean Check objects
 */
checkDataService.findLatestCheck = async function (criteria) {
  return Check.findOne(criteria).sort({ field: 'asc', _id: -1 }).lean().exec()
}

/**
 * Find Checks by criteria: e.g. checkDataService.find({checkWindowId: 1234})
 * @param criteria
 * @return {Promise.<void>} - lean Check objects, fully populated
 * This includes the pupil (includes the school), checkWindow, and checkForm.  This is fairly efficient
 * involving 1 extra query per document set per sub-document.  The whole lot is done in 5 queries total.
 */
checkDataService.findFullyPopulated = async function (criteria) {
  return Check.find(criteria)
    .populate({path: 'pupilId', populate: {path: 'school'}})
    .populate('checkWindowId')
    .populate('checkFormId')
    .lean()
    .exec()
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

/**
 * Create a new Check
 * @param data
 * @return {Promise}
 */
checkDataService.create = async function (data) {
  const check = new Check(data)
  return check.save()
}

module.exports = checkDataService
