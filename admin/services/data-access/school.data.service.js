'use strict'

const { TYPES } = require('./sql.service')
const R = require('ramda')
const sqlService = require('./sql.service')
const config = require('../../config')

const table = '[school]'

const schoolDataService = {
  /**
   * Find a School by the id
   * number -> {School} || undefined
   * @param {number} id
   * @return {Promise<object>}
   */
  sqlFindOneById: async (id) => {
    const paramId = { name: 'id', type: TYPES.Int, value: id }
    const sql = `
        SELECT school.*, ISNULL(sce.timezone, '${config.DEFAULT_TIMEZONE}') as timezone
        FROM ${sqlService.adminSchema}.${table}
        LEFT JOIN ${sqlService.adminSchema}.sce
          ON sce.school_id = school.id
        WHERE school.id = @id
      `
    const rows = await sqlService.query(sql, [paramId], `schoolData.sqlFindOneById.${id}`)
    return R.head(rows)
  },

  /**
   * Find a School from the pin
   * @param {number} pin
   * @return {Promise<void>}
   */
  sqlFindOneBySchoolPin: async (pin) => {
    const paramPin = { name: 'pin', type: TYPES.Char, value: pin }
    const sql = `
        SELECT *    
        FROM ${sqlService.adminSchema}.${table}
        WHERE pin = @pin
      `
    const rows = await sqlService.query(sql, [paramPin])
    return R.head(rows)
  },

  /**
   * Find a School by DfeNumber
   * @param dfeNumber
   * @return {Promise<object>}
   */
  sqlFindOneByDfeNumber: async (dfeNumber) => {
    const paramDfeNumber = { name: 'dfeNumber', type: TYPES.Int, value: dfeNumber }
    const sql = `
        SELECT school.*, ISNULL(sce.timezone, '${config.DEFAULT_TIMEZONE}') as timezone
        FROM ${sqlService.adminSchema}.${table}
        LEFT JOIN ${sqlService.adminSchema}.sce
          ON sce.school_id = school.id
        WHERE dfeNumber = @dfeNumber
      `
    const rows = await sqlService.query(sql, [paramDfeNumber])
    return R.head(rows)
  },

  /**
   * Update school.
   * @param update
   * @returns {Promise<*>}
   */
  sqlUpdate: async (update) => {
    return sqlService.update(table, update, true)
  },

  /**
   * Find school by array of ids.
   * @param ids
   * @returns {Promise<*>}
   */
  sqlFindByIds: async (ids) => {
    if (!(Array.isArray(ids) && ids.length > 0)) {
      throw new Error('No ids provided')
    }
    const select = `
    SELECT *
    FROM ${sqlService.adminSchema}.${table}
    `
    const { params, paramIdentifiers } = sqlService.buildParameterList(ids, TYPES.Int)
    const whereClause = 'WHERE id IN (' + paramIdentifiers.join(', ') + ')'
    const sql = [select, whereClause].join(' ')
    return sqlService.query(sql, params)
  },

  /**
   * Find schools by DfeNumbers
   * @param {Array} dfeNumbers
   * @return {Promise<void>}
   */
  sqlFindByDfeNumbers: async (dfeNumbers) => {
    if (!(Array.isArray(dfeNumbers) && dfeNumbers.length > 0)) {
      throw new Error('No dfeNumbers provided')
    }
    const select = `
  SELECT *
  FROM ${sqlService.adminSchema}.${table}
  `
    const { params, paramIdentifiers } = sqlService.buildParameterList(dfeNumbers, TYPES.Int)
    const whereClause = 'WHERE dfeNumber IN (' + paramIdentifiers.join(', ') + ')'
    const sql = [select, whereClause].join(' ')
    return sqlService.query(sql, params)
  }
}

module.exports = schoolDataService
