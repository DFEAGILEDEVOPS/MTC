'use strict'
const {TYPES} = require('tedious')
const R = require('ramda')
const monitor = require('../../helpers/monitor')

const sqlService = require('./sql.service')

const table = '[psychometricianReportCache]'

const psychometricianReportCacheDataService = {
  /**
   * Batch insert multiple objects
   * @param {Array.<object>} dataObjects
   * @return {Promise<{insertId: Array<number>, rowsModified: <number>}>}
   */
  sqlInsertMany: async function (dataObjects) {
    const insertSql = `
    DECLARE @output TABLE (id int);
    INSERT INTO ${sqlService.adminSchema}.${table} 
    (check_id, jsonData)
    OUTPUT inserted.ID INTO @output
    VALUES
    `
    const output = `; SELECT * from @output`
    const values = []
    const params = []
    for (let i = 0; i < dataObjects.length; i++) {
      values.push(`(@checkId${i}, @data${i})`)
      params.push(
        {
          name: `checkId${i}`,
          value: dataObjects[i]['check_id'],
          type: TYPES.Int
        },
        {
          name: `data${i}`,
          value: JSON.stringify(dataObjects[i]['jsonData']),
          type: TYPES.NVarChar
        }
      )
    }
    const sql = [insertSql, values.join(',\n'), output].join(' ')
    const res = await sqlService.modify(sql, params)
    // E.g. { insertId: [1, 2], rowsModified: 4 }
    return res
  },

  /**
   * Find all report data
   * @return {Promise<*>}
   */
  sqlFindAll: async function () {
    const sql = `select * from ${sqlService.adminSchema}.${table}`
    const results = await sqlService.query(sql)
    const parsed = results.map(x => {
      const d = JSON.parse(x.jsonData)
      return R.assoc('jsonData', d, x)
    })
    return parsed
  },

  sqlDeleteAll: async function () {
    return sqlService.modify(`DELETE FROM ${sqlService.adminSchema}.${table}`)
  },

  /**
   * Find checks that do not have entries in the psychometrician report cache table
   * @return {Promise<*>}
   */
  sqlFindUnprocessedChecks: async function () {
    const sql = `SELECT TOP 250 c.* 
      FROM ${sqlService.adminSchema}.${table} p 
      RIGHT OUTER JOIN ${sqlService.adminSchema}.[check] c ON p.check_id = c.id 
      WHERE p.check_id IS NULL`
    return sqlService.query(sql)
  },

  /**
   * Find all the started checks that have not been processed
   * @returns {Boolean}
   */
  sqlHasUnprocessedStartedChecks: async function () {
    const sql = `SELECT TOP 1 *
    FROM ${sqlService.adminSchema}.[check] chk
    LEFT JOIN ${sqlService.adminSchema}.psychometricianReportCache prc
      ON chk.id = prc.check_id
      WHERE prc.check_id IS NULL AND chk.startedAt IS NOT NULL`

    const result = await sqlService.query(sql, [])
    return result.length > 0
  },

  /**
   * Returns an array of Ids: [1234, 5678, ...] of started checks.  Used by the batch processor.
   * @param batchSize the size of the batch to work with
   * @returns {Array}
   */
  sqlFindUnprocessedStartedChecks: async function (batchSize) {
    if (!batchSize) {
      throw new Error('Missing argument: batchSize')
    }
    const safeBatchSize = parseInt(batchSize, 10)

    const sql = `SELECT TOP ${safeBatchSize} chk.id 
    FROM ${sqlService.adminSchema}.[check] chk
      LEFT JOIN ${sqlService.adminSchema}.psychometricianReportCache prc
        ON chk.id = prc.check_id
        WHERE prc.check_id IS NULL AND chk.startedAt IS NOT NULL
        ORDER BY chk.startedAt`

    const results = await sqlService.query(sql)
    return results.map(r => r.id)
  }

}

module.exports = monitor('psychometricianReportCache.data-service', psychometricianReportCacheDataService)
