'use strict'

const { TYPES } = require('tedious')
const monitor = require('../../helpers/monitor')
const sqlService = require('./sql.service')
const accessArrangementsDataService = {}

/**
 * Find access arrangements
 * @returns {Promise<Array>}
 */
accessArrangementsDataService.sqlFindAccessArrangements = async function () {
  const sql = `
  SELECT 
    id, 
    code, 
    description
  FROM ${sqlService.adminSchema}.[accessArrangements]
  ORDER BY displayOrder ASC`
  return sqlService.query(sql)
}

/**
 * Find access arrangement by pupil Id
 * @returns {Promise<Array>}
 */
accessArrangementsDataService.sqlFindAccessArrangementByPupilId = async function () {
  const sql = `
  SELECT 
    id, 
    code, 
    description
  FROM ${sqlService.adminSchema}.[accessArrangements]
  WHERE`
  return sqlService.query(sql)
}

/**
 * Find access arrangement by codes
 * @param {Number} codes
 * @returns {Promise<Array>}
 */
accessArrangementsDataService.sqlFindAccessArrangementsByCodes = async function (codes) {
  if (!(Array.isArray(codes) && codes.length > 0)) {
    throw new Error('No ids provided')
  }
  const select = `
    SELECT *
    FROM ${sqlService.adminSchema}.[accessArrangements]
    `

  const {params, paramIdentifiers} = sqlService.buildParameterList(codes, TYPES.NVarChar)
  const whereClause = 'WHERE code IN (' + paramIdentifiers.join(', ') + ')'
  const sql = [select, whereClause].join(' ')
  return sqlService.query(sql, params)
}

module.exports = monitor('access-arrangements.data-service', accessArrangementsDataService)
