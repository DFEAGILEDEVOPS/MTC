'use strict'

const sqlService = require('./sql.service')
const TYPES = require('tedious').TYPES
const R = require('ramda')
const completedCheckDataService = {}
const checkDataService = require('./check.data.service')

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
    if (!x.data) {
      return R.clone(x)
    }
    const d = JSON.parse(x.data)
    return R.assoc('data', d.data, x)
  })
  return parsed
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

// used by PS Report to set all unmarked

completedCheckDataService.sqlSetAllUnmarked = async () => {
  const sql = `UPDATE [mtc_admin].[check] SET markedAt=NULL`
  return sqlService.modify(sql)
}

/**
 * Return a single check with the SPA data as an object
 * @param checkCode
 * @return {Promise<void>}
 */
completedCheckDataService.sqlFindOneByCheckCode = async function (checkCode) {
  const params = [
    {
      name: 'checkCode',
      value: checkCode,
      type: TYPES.UniqueIdentifier
    }
  ]
  const result = await sqlService.query(`SELECT * FROM ${sqlService.adminSchema}.[check] WHERE checkCode=@checkCode`, params)

  // Hydrate the JSON string in to an object
  const first = R.head(result)
  return R.assoc('data', (JSON.parse(first.data)).data, first)
}

module.exports = completedCheckDataService
