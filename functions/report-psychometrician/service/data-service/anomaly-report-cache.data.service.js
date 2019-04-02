'use strict'
const sqlService = require('../../../lib/sql/sql.service')
const { TYPES } = sqlService

const table = '[anomalyReportCache]'

const anomalyReportCacheDataService = {
  /**
   * Batch insert multiple objects
   * @param {Array.<object>} dataObjects
   * @return {Promise<{insertId: Array<number>, rowsModified: <number>}>}
   */
  sqlInsertMany: async function (dataObjects) {
    if (!dataObjects) {
      throw new Error('No anomalies to save')
    }
    if (!Array.isArray(dataObjects)) {
      throw new Error('dataObjects must be an array')
    }
    if (dataObjects.length === 0) {
      throw new Error('No dataObjects provided to save')
    }
    const insertSql = `
    DECLARE @output TABLE (id int);
    INSERT INTO [mtc_admin].${table}
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
  }
}

module.exports = anomalyReportCacheDataService
