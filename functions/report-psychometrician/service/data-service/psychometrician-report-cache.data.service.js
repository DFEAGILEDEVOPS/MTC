'use strict'
const sqlService = require('less-tedious')
const { TYPES } = require('tedious')

const config = require('../../../config')
sqlService.initialise(config)

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
      LEFT JOIN ${sqlService.adminSchema}.psychometricianReportCache prc ON (chk.id = prc.check_id)
      JOIN ${sqlService.adminSchema}.[checkStatus] cs ON (chk.checkStatus_id = cs.id)
      WHERE 
        prc.check_id IS NULL 
      AND cs.code = 'CMP'
      AND chk.markedAt IS NOT NULL
      ORDER BY chk.startedAt`

    const results = await sqlService.query(sql)
    return results.map(r => r.id)
  }
}

module.exports = psychometricianReportCacheDataService
