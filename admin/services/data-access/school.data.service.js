'use strict'

const { TYPES } = require('tedious')
const R = require('ramda')
const winston = require('winston')

const sqlService = require('./sql.service')
const School = require('../../models/school')
const table = '[school]'
const schoolDataService = {}

/**
 * @deprecated Please use an sql* method instead
 * @param options
 * @return {Promise<Promise|*>}
 */
schoolDataService.findOne = async function (options) {
  winston.warn('*** schoolDataService.findOne is deprecated ***')
  return School.findOne(options).lean().exec()
}

/**
 * Find Schools by criteria: e.g. schoolDataService.find({_id: '1234'})
 * @param criteria
 * @deprecated Use an sql* method instead
 * @return {Promise.<void>} - lean School objects
 */
schoolDataService.find = async function (criteria) {
  winston.warn('*** schoolDataService.find is deprecated ***')
  return School.find(criteria).lean().exec()
}

/**
 * Update a single document
 * Example: `const res = await schoolDataService.update({_id: 9991999}, { $set: {name: 'Some Primary School'}})`
 * Example: `const res = await schoolDataService.update({_id: 9991999}, { _id: 9991999, name: 'Some Primary School', anotherProp: someVal, ...})`
 * @param {object} id  - the _id to match in the db
 * @deprecated Use an sql* method instead
 * @param {object} doc - the update to run
 * @return {Promise<void>} - E.g. `{ n: 1, nModified: 1, ok: 1 }`
 */
schoolDataService.update = async function (id, doc) {
  winston.warn('*** schoolDataService.update is deprecated ***')
  return School.updateOne({ _id: id }, doc).exec()
}

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

schoolDataService.sqlUpdate = async function (update) {
  return sqlService.update(table, update)
}

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

module.exports = schoolDataService
