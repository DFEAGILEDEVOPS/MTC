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
checkDataService.findOneByCheckCode = async function (checkCode) {
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
// NOT USED - will not replace with sql call
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
 * Find latest check for pupil
 * @param pupilId - the pupil taking the check
 * @param started - if true returns latest started check only
 * @return {Promise.<void>} - lean Check objects
 */
checkDataService.sqlFindLatestCheck = async function (pupilId, started) {
  let sql = 'SELECT * FROM [mtc_admin].[check] WHERE pupil_id = @pupilId'
  if (started) {
    sql = sql + ' AND startedAt IS NOT NULL'
  }
  const params = [
    {
      name: 'pupilId',
      value: pupilId,
      type: TYPES.Int
    }
  ]
  return sqlService.query(sql, params)
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
 * Find Checks and associated data by checkCode
 * @param checkCodes - array of UUID
 * @return {Promise.<void>} - lean Check objects, fully populated
 * This includes the pupil (includes the school), checkWindow, and checkForm.  This is fairly efficient
 * involving 1 extra query per document set per sub-document.  The whole lot is done in 5 queries total.
 */
checkDataService.sqlFindFullyPopulated = async function (checkCodes) {
  let sql = 'SELECT * FROM mtc_admin.[check] chk INNER JOIN mtc_admin.pupil pup ON pup.id = chk.pupil_id INNER JOIN mtc_admin.school sch ON sch.id = pup.school_id INNER JOIN mtc_admin.checkWindow wdw ON wdw.id = chk.checkWindow_id INNER JOIN mtc_admin.checkForm frm ON frm.id = chk.checkForm_id'
  let whereClause = ' WHERE chk.checkCode IN ('
  const params = []
  for (let index = 0; index < checkCodes.length; index++) {
    whereClause = whereClause + `@p${index}`
    params.push({
      name: `p${index}`,
      value: checkCodes[index],
      type: TYPES.UniqueIdentifier
    })
  }
  whereClause = whereClause + ')'
  sql = sql + whereClause
  return sqlService.query(sql, params)
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
