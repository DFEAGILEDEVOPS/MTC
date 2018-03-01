'use strict'

const { TYPES } = require('tedious')
const R = require('ramda')
const sqlService = require('./sql.service')
const table = '[school]'
const schoolDataService = {}

/** SQL METHODS **/

/**
 * Find a School by the id
 * number -> {School} || undefined
 * @param {number} id
 * @return {Promise<object>}
 */
schoolDataService.sqlFindOneById = async function (id) {
  return sqlService.findOneById(table, id)
}

/**
 * Find a School from the pin
 * @param {number} pin
 * @return {Promise<void>}
 */
schoolDataService.sqlFindOneBySchoolPin = async function (pin) {
  const paramPin = { name: 'pin', type: TYPES.Char, value: pin }
  const sql = `
      SELECT *    
      FROM ${sqlService.adminSchema}.${table}
      WHERE pin = @pin
    `
  const rows = await sqlService.query(sql, [paramPin])
  return R.head(rows)
}

/**
 * Find a School by DfeNumber
 * @param dfeNumber
 * @return {Promise<void>}
 */
schoolDataService.sqlFindOneByDfeNumber = async function (dfeNumber) {
  const paramDfeNumber = { name: 'dfeNumber', type: TYPES.Int, value: dfeNumber }
  const sql = `
      SELECT *    
      FROM ${sqlService.adminSchema}.${table}
      WHERE dfeNumber = @dfeNumber
    `
  const rows = await sqlService.query(sql, [paramDfeNumber])
  return R.head(rows)
}

/**
 * Update school.
 * @param update
 * @returns {Promise<*>}
 */
schoolDataService.sqlUpdate = async function (update) {
  return sqlService.update(table, update)
}

/**
 * Find school by array of ids.
 * @param ids
 * @returns {Promise<*>}
 */
schoolDataService.sqlFindByIds = async function (ids) {
  if (!(Array.isArray(ids) && ids.length > 0)) {
    throw new Error('No ids provided')
  }
  const select = `
  SELECT *
  FROM ${sqlService.adminSchema}.${table}
  `
  const {params, paramIdentifiers} = sqlService.buildParameterList(ids, TYPES.Int)
  const whereClause = 'WHERE id IN (' + paramIdentifiers.join(', ') + ')'
  const sql = [select, whereClause].join(' ')
  return sqlService.query(sql, params)
}

/**
 * Find schools by DfeNumbers
 * @param {Array} dfeNumbers
 * @return {Promise<void>}
 */
schoolDataService.sqlFindByDfeNumbers = async function (dfeNumbers) {
  if (!(Array.isArray(dfeNumbers) && dfeNumbers.length > 0)) {
    throw new Error('No dfeNumbers provided')
  }
  const select = `
  SELECT *
  FROM ${sqlService.adminSchema}.${table}
  `
  const {params, paramIdentifiers} = sqlService.buildParameterList(dfeNumbers, TYPES.Int)
  const whereClause = 'WHERE dfeNumber IN (' + paramIdentifiers.join(', ') + ')'
  const sql = [select, whereClause].join(' ')
  return sqlService.query(sql, params)
}

module.exports = schoolDataService
