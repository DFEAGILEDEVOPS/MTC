'use strict'

const { TYPES } = require('tedious')
const R = require('ramda')
const pupilDataService = {}
const table = '[pupil]'
const sqlService = require('./sql.service')

/** SQL METHODS */

/**
 * Find a pupil by school id and pupil pin
 * @param {number} pin
 * @param {number} schoolId
 * @return {Promise<void>}
 */
pupilDataService.sqlFindOneByPinAndSchool = async (pin, schoolId) => {
  const paramPupilPin = { name: 'pin', type: TYPES.NVarChar, value: pin }
  const paramSchool = { name: 'schoolId', type: TYPES.Int, value: schoolId }
  const sql = `
      SELECT TOP 1 
        *    
      FROM ${sqlService.adminSchema}.${table}
      WHERE pin = @pin and school_id = @schoolId   
    `
  const results = await sqlService.query(sql, [paramPupilPin, paramSchool])
  return R.head(results)
}

/**
 * Update am existing pupil object.  Must provide the `id` field
 * @param update
 * @return {Promise<*>}
 */
pupilDataService.sqlUpdate = async (update) => {
  return sqlService.update(table, update)
}

/**
 * Find pupils for a school with pins that have not yet expired
 * @param dfeNumber
 * @return {Promise<*>}
 */
pupilDataService.sqlFindPupilsWithActivePins = async (dfeNumber) => {
  const paramDfeNumber = { name: 'dfeNumber', type: TYPES.Int, value: dfeNumber }
  const sql = `
  SELECT p.*, g.group_id 
  FROM ${sqlService.adminSchema}.${table} p 
  INNER JOIN ${sqlService.adminSchema}.[school] s
    ON p.school_id = s.id
  LEFT JOIN  ${sqlService.adminSchema}.[pupilGroup] g
    ON g.pupil_id = p.id 
  WHERE p.pin IS NOT NULL
  AND s.dfeNumber = @dfeNumber
  AND p.pinExpiresAt IS NOT NULL
  AND p.pinExpiresAt > GETUTCDATE()
  ORDER BY p.lastName ASC, p.foreName ASC, p.middleNames ASC, dateOfBirth ASC
  `
  return sqlService.query(sql, [paramDfeNumber])
}

/**
 * Find pupils by ids
 * @param ids
 * @return {Promise<void>}
 */
pupilDataService.sqlFindByIds = async (ids) => {
  if (!(Array.isArray(ids) && ids.length > 0)) {
    throw new Error('No ids provided')
  }
  const select = `
  SELECT *
  FROM ${sqlService.adminSchema}.${table}
  `
  const {params, paramIdentifiers} = sqlService.buildParameterList(ids, TYPES.Int)
  const whereClause = 'WHERE id IN (' + paramIdentifiers.join(', ') + ')'
  const orderClause = 'ORDER BY lastName ASC, foreName ASC, middleNames ASC, dateOfBirth ASC'
  const sql = [select, whereClause, orderClause].join(' ')
  return sqlService.query(sql, params)
}

/**
 * Find pupils by ids and dfeNumber.
 * @param ids
 * @param dfeNumber
 * @returns {Promise<*>}
 */
pupilDataService.sqlFindByIdAndDfeNumber = async function (ids, dfeNumber) {
  const select = `
      SELECT p.* 
      FROM 
      ${sqlService.adminSchema}.${table} p JOIN [school] s ON p.school_id = s.id
      `
  const {params, paramIdentifiers} = sqlService.buildParameterList(ids, TYPES.Int)
  const whereClause = 'WHERE p.id IN (' + paramIdentifiers.join(', ') + ')'
  const andClause = 'AND s.dfeNumber = @dfeNumber'
  params.push({name: 'dfeNumber', value: dfeNumber, type: TYPES.Int})
  const sql = [select, whereClause, andClause].join(' ')
  return sqlService.query(sql, params)
}

/**
 * Batch update pupil pins
 * @param pupils
 * @return {Promise<void>}
 */
pupilDataService.sqlUpdatePinsBatch = async (pupils) => {
  const params = []
  const update = []
  pupils.forEach((p, i) => {
    update.push(`UPDATE ${sqlService.adminSchema}.${table} 
    SET pin = @pin${i}, pinExpiresAt=@pinExpiredAt${i} 
    WHERE id = @id${i}`)
    params.push({
      name: `pin${i}`,
      value: p.pin,
      type: TYPES.NVarChar
    })
    params.push({
      name: `pinExpiredAt${i}`,
      value: p.pinExpiresAt,
      type: TYPES.DateTimeOffset
    })
    params.push({
      name: `id${i}`,
      value: p.id,
      type: TYPES.Int
    })
  })
  const sql = update.join(';\n')
  return sqlService.modify(sql, params)
}

module.exports = pupilDataService
