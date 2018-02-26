'use strict'
const { TYPES } = require('tedious')
const R = require('ramda')
const sqlService = require('./sql.service')
const table = '[pupilRestart]'
const pupilRestartDataService = {}

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
  WHERE pupil_id=@pupilId AND isDeleted=0
  AND DATEDIFF(day, createdAt, GETUTCDATE()) = 0`
  const params = [
    {
      name: 'pupilId',
      value: pupilId,
      type: TYPES.Int
    }
  ]
  const result = await sqlService.query(sql, params)
  const obj = R.head(result)
  return R.prop('cnt', obj)
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
  return R.prop('description', obj)
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
  ORDER BY displayOrder ASC`
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
  return R.prop('id', obj)
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
      name: 'pupilId',
      value: pupilId,
      type: TYPES.Int
    },
    {
      name: 'userId',
      value: userId,
      type: TYPES.Int
    }
  ]
  const sql = `UPDATE ${sqlService.adminSchema}.[pupilRestart] 
  SET isDeleted=1, deletedByUser_id=@userId  
  WHERE pupil_id = @pupilId`
  return sqlService.modify(sql, params)
}

module.exports = pupilRestartDataService
