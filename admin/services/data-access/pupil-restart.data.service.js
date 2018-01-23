'use strict'
const { TYPES } = require('tedious')
const R = require('ramda')
const sqlService = require('./sql.service')
const PupilRestart = require('../../models/pupil-restart')
const RestartCode = require('../../models/restart-code')
const table = '[pupilRestart]'
const pupilRestartDataService = {}

/**
 * Create a new Pupil restart
 * @param data
 * @deprecated Please use sqlCreate method instead
 * @return {Promise}
 */
pupilRestartDataService.create = async function (data) {
  const pupilRestart = new PupilRestart(data)
  await pupilRestart.save()
  return pupilRestart.toObject()
}

/**
 * Update a Pupil restart
 * @param query
 * @param criteria
 * @deprecated Please use sqlMarkRestartAsDeleted method instead
 * @return {Promise}
 */
pupilRestartDataService.update = async function (query, criteria) {
  return PupilRestart.updateOne(query, criteria).exec()
}

/**
 * Find the count
 * @param query
 * @deprecated Please use sqlGetNumberOfRestartsByPupil method instead
 * @return {Promise.<*>}
 */
pupilRestartDataService.count = async function (query) {
  return PupilRestart.count(query).exec()
}

/**
 * Find and return the latest single restart by criteria in `options`
 * @param options
 * @deprecated Please use sqlFindLatestRestart method instead
 * @return {Promise.<{Object}>}
 */
pupilRestartDataService.findLatest = async function (options) {
  const latest = await PupilRestart.find(options).sort({ $natural: -1 }).limit(1).lean().exec()
  return latest[0]
}

/**
 * Get all the restart codes documents
 * @deprecated Please use sqlFindRestartCodes instead
 * @return {Promise.<{Object}>}
 */
pupilRestartDataService.getRestartCodes = async () => {
  return RestartCode.find().lean().exec()
}

/** SQL METHODS **/

/**
 * Create a new pupil restart.
 * @param {object} data
 * @return  { insertId: <number>, rowsModified: <number> }
 */
pupilRestartDataService.sqlCreate = async (data) => {
  return sqlService.create(table, data)
}

/**
 * Returns number of restarts specified by pupil id
 * @param pupilId
 * @return {Promise.<*>}
 */
pupilRestartDataService.sqlGetNumberOfRestartsByPupil = async function (pupilId) {
  const sql = `SELECT COUNT(*) AS [cnt]
  FROM ${sqlService.adminSchema}.[pupilRestart] 
  WHERE pupil_id=@pupilId AND isDeleted=0`
  const params = [
    {
      name: 'pupilId',
      value: pupilId,
      type: TYPES.Int
    }
  ]
  const result = await sqlService.query(sql, params)
  const obj = R.head(result)
  return obj['cnt']
}

/**
 * Find latest restart for pupil
 * @param pupilId
 * @return {Promise.<void>}
 */
pupilRestartDataService.sqlFindLatestRestart = async function (pupilId) {
  const sql = `SELECT TOP 1 * 
  FROM ${sqlService.adminSchema}.[pupilRestart] 
  WHERE pupil_id=@pupilId AND isDeleted=0 
  ORDER BY createdAt DESC`
  const params = [
    {
      name: 'pupilId',
      value: pupilId,
      type: TYPES.Int
    }
  ]
  const result = await sqlService.query(sql, params)
  return R.head(result)
}

/**
 * Find pupil's restart codes
 * @return {Promise.<void>}
 */
pupilRestartDataService.sqlFindRestartCodes = async function () {
  const sql = `
  SELECT 
    id, 
    code, 
    description
  FROM ${sqlService.adminSchema}.[pupilRestartCode]
  ORDER BY description ASC`
  return sqlService.query(sql)
}

/**
 * Find pupil's restart reason description by id
 * @param id
 * @return {Promise.<void>}
 */
pupilRestartDataService.sqlFindRestartReasonDescById = async function (id) {
  console.log('fdsfdsdsfdsfdsfasd', id)
  const sql = `
  SELECT 
    description
  FROM ${sqlService.adminSchema}.[pupilRestartReason]
  WHERE id=@id
  ORDER BY description ASC`
  const params = [
    {
      name: 'id',
      value: id,
      type: TYPES.Int
    }
  ]
  const result = await sqlService.query(sql, params)
  const obj = R.head(result)
  return obj['description']
}

/**
 * Find restart reasons
 * @return {Promise.<void>}
 */
pupilRestartDataService.sqlFindRestartReasons = async function () {
  const sql = `
  SELECT 
    id, 
    code, 
    description
  FROM ${sqlService.adminSchema}.[pupilRestartReason]
  ORDER BY id ASC`
  return sqlService.query(sql)
}

/**
 * Find restart reason id
 * @return {Number}
 */
pupilRestartDataService.sqlFindRestartReasonByCode = async function (code) {
  const sql = `
  SELECT TOP 1 id
  FROM ${sqlService.adminSchema}.[pupilRestartReason]
  WHERE code = @code`
  const params = [
    {
      name: 'code',
      value: code,
      type: TYPES.Char
    }
  ]
  const result = await sqlService.query(sql, params)
  const obj = R.head(result)
  return obj.id
}

/**
 * Mark an existing pupil restart as deleted
 * @param pupilId
 * @param userId
 * @return {Promise<*>}
 */
pupilRestartDataService.sqlMarkRestartAsDeleted = async (pupilId, userId) => {
  const params = [
    {
      name: 'pupil_id',
      value: pupilId,
      type: TYPES.Int
    },
    {
      name: 'deletedByUser_id',
      value: userId,
      type: TYPES.Int
    }
  ]
  const sql = `UPDATE ${sqlService.adminSchema}.[pupilRestart] 
  SET isDeleted=1, deletedByUser_id=@deletedByUser_id  
  WHERE pupil_id = @pupil_id`
  return sqlService.modify(sql, params)
}

module.exports = pupilRestartDataService
