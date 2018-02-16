'use strict'
const {TYPES} = require('tedious')
const R = require('ramda')

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
    const sql = `select * from ${table}`
    const results = await sqlService.query(sql)
    const parsed = results.map(x => {
      const d = JSON.parse(x.jsonData)
      return R.assoc('jsonData', d, x)
    })
    return parsed
  },

  sqlDeleteAll: async function () {
    return sqlService.modify(`DELETE FROM ${table}`)
  },

  /**
   * Find checks that do not have entries in the psychometrician report cache table
   * @return {Promise<*>}
   */
  sqlFindUnprocessedChecks: async function () {
    const sql = `SELECT c.* 
      FROM ${sqlService.adminSchema}.${table} p 
      RIGHT OUTER JOIN ${sqlService.adminSchema}.[check] c ON p.check_id = c.id 
      WHERE p.check_id IS NULL
      `
    return sqlService.query(sql)
  }

}

module.exports = psychometricianReportCacheDataService
