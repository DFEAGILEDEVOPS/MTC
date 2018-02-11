'use strict'

const CompletedChecks = require('../../models/completed-checks')
const sqlService = require('./sql.service')
const TYPES = require('tedious').TYPES
const R = require('ramda')
const completedCheckDataService = {}
const checkDataService = require('./check.data.service')

/**
 * Query : find a completedCheck document that has not been marked
 * @deprecated mongoose specific
 * @type {{$or: [null,null]}}
 */
const unmarkedQueryCriteria = {
  '$or': [
    { isMarked: { $exists: false } },
    { isMarked: false }
  ]
}

/**
 * Create a new Check
 * @param data
 * @deprecated use sqlCreate
 * @return {Promise}
 */
completedCheckDataService.create = async function (data) {
  const completedCheck = new CompletedChecks(data)
  return completedCheck.save()
} // used by check-complete.service to insert pupil check

/**
 * @description inserts a new check to the database
 * @param {object} data JSON object to insert
 */
completedCheckDataService.sqlCreate = async function (data) {
  return sqlService.create('[check]', data)
}

/**
 * Updates check record with results
 * @param checkCode
 * @param completedCheck the entire JSON payload submitted by the pupil
 * @return {Promise}
 */
completedCheckDataService.sqlAddResult = async function (checkCode, completedCheck) {
  const params = [
    {
      name: 'checkCode',
      value: checkCode,
      type: TYPES.UniqueIdentifier
    }
  ]
  // TODO: Refactor to extract two DL methods from this to make it simpler
  // TODO: The error should be thrown from a service method instead
  const sql = `SELECT id FROM ${sqlService.adminSchema}.[check] WHERE checkCode=@checkCode`
  let result = await sqlService.query(sql, params)
  result = R.head(result)
  if (!result || !result.id) {
    throw new Error(`Could not find check with checkCode:${checkCode}`)
  }
  const checkId = result.id
  const checkDataParams = {
    'id': checkId,
    'data': JSON.stringify(completedCheck)
  }
  return sqlService.update('[check]', checkDataParams)
}

/**
 * updates check document
 * @deprecated unused - no replacement
 * @param {*} doc
 */
completedCheckDataService.save = async function (doc) {
  return CompletedChecks.replaceOne({_id: doc._id}, doc).exec()
}

/**
 * Find one or more documents. Returns an array or null.
 * @param criteria
 * @deprecated use sqlFindOne and sqlFindByIds
 * @return {Promise.<*>}
 */
completedCheckDataService.find = async function (criteria) {
  return CompletedChecks.find(criteria).lean().exec()
}
// used by pupil-status.service to find latest completed check by pupil

/**
 * @param {string} checkCode
 * @deprecated - Use checkDataService.sqlFindOneByCheckCode instead
 */
completedCheckDataService.sqlFindOne = async (checkCode) => {
  const result = await checkDataService.sqlFindOneByCheckCode(checkCode)
  return R.head(result)
}

/**
 *
 * @param {Array<object>} batchIds array of integers
 * @return {Promise<Array>}
 */
completedCheckDataService.sqlFindByIds = async (batchIds) => {
  let select = `SELECT * FROM [mtc_admin].[check]`
  const where = sqlService.buildParameterList(batchIds, TYPES.Int)
  const sql = [select, 'WHERE id IN (', where.paramIdentifiers.join(', '), ')'].join(' ')
  // Populate the JSON data structure which is stored as a string in the SQL DB
  const results = await sqlService.query(sql, where.params)
  const parsed = results.map(x => {
    console.log('parsing ', x)
    if (!x.data) {
      return R.clone(x)
    }
    const d = JSON.parse(x.data)
    return R.assoc('data', d.data, x)
  })
  return parsed
}

/**
 * Count the number of documents that match `criteria`
 * @param criteria
 * @deprecated unused
 * @return {Promise.<*>}
 */
completedCheckDataService.count = async function (criteria) {
  return CompletedChecks.count(criteria).exec()
}

/**
 * Return a boolean if there are documents that have not been marked.
 * @deprecated use sqlHasUnmarked
 * @return {Promise.<boolean>}
 */
completedCheckDataService.hasUnmarked = async function () {
  const count = await this.count(unmarkedQueryCriteria)
  return count > 0
}

/**
 * @description returns a boolean indicating whether there are unmarked checks in the database
 */
completedCheckDataService.sqlHasUnmarked = async () => {
  const sql = `SELECT COUNT(*) as [unmarkedCount] FROM [mtc_admin].[check] WHERE markedAt IS NULL`
  const result = await sqlService.query(sql)
  return result[0].unmarkedCount > 0
}

/**
 * Return plain completedCheck objects that have not been marked, up to a the limit specified by `batchsize`
 * Returns an array of Ids: [1234, 5678, ...] of CompletedChecks.  Used by the batch processor.
 * @param batchSize
 * @deprecated use sqlFindUnmarked
 * @return {Promise.<Array>}
 */
completedCheckDataService.findUnmarked = async function (batchSize) {
  if (!batchSize) {
    throw new Error('Missing argument: batchSize')
  }
  const batchIds = await CompletedChecks.find(
    unmarkedQueryCriteria, { _id: 1 }
  )
    // .sort({ createdAt: 1 })
    .limit(batchSize)
    .lean()
    .exec()
  return batchIds.map(b => b._id)
}

/**
 * Returns an array of Ids: [1234, 5678, ...] of CompletedChecks.  Used by the batch processor.
 * @param batchSize the size of the batch to work with
 * @return {Promise.<Array>}
 */
completedCheckDataService.sqlFindUnmarked = async function (batchSize) {
  if (!batchSize) {
    throw new Error('Missing argument: batchSize')
  }
  const safeBatchSize = parseInt(batchSize, 10)

  const sql = `SELECT TOP ${safeBatchSize} id FROM [mtc_admin].[check] WHERE markedAt IS NULL`
  const results = await sqlService.query(sql)
  return results.map(r => r.id)
}

/**
 * Generalised update function - use with care
 * @param query
 * @param criteria
 * @deprecated use sqlSetAllUnmarked
 * @return {Promise}
 */
completedCheckDataService.update = async function (query, criteria, options = {}) {
  return CompletedChecks.update(query, criteria, options).exec()
}
// used by PS Report to set all unmarked

completedCheckDataService.sqlSetAllUnmarked = async () => {
  const sql = `UPDATE [mtc_admin].[check] SET markedAt=NULL`
  return sqlService.modify(sql)
}

module.exports = completedCheckDataService
