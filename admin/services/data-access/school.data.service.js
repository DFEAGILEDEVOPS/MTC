'use strict'

const { TYPES } = require('tedious')
const R = require('ramda')
const sqlService = require('./sql.service')
const School = require('../../models/school')
const table = '[school]'
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

/**
 * Update a single document
 * Example: `const res = await schoolDataService.update({_id: 9991999}, { $set: {name: 'Some Primary School'}})`
 * Example: `const res = await schoolDataService.update({_id: 9991999}, { _id: 9991999, name: 'Some Primary School', anotherProp: someVal, ...})`
 * @param {object} id  - the _id to match in the db
 * @param {object} doc - the update to run
 * @return {Promise<void>} - E.g. `{ n: 1, nModified: 1, ok: 1 }`
 */
schoolDataService.update = async function (id, doc) {
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
      FROM ${table}
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
      FROM ${table}
      WHERE dfeNumber = @dfeNumber
    `
  const rows = await sqlService.query(sql, [paramDfeNumber])
  return R.head(rows)
}

schoolDataService.sqlUpdate = async function (update) {
  return sqlService.update(table, update)
}

module.exports = schoolDataService
