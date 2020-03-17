'use strict'
const sqlService = require('../../../lib/sql/sql.service')
const { TYPES } = sqlService

function getUnprocessedChecksSql (batchSize) {
  const safeBatchSize = parseInt(batchSize, 10)
  return `SELECT TOP ${safeBatchSize} chk.id
      FROM [mtc_admin].[check] chk
      LEFT JOIN [mtc_admin].psychometricianReportCache prc ON (chk.id = prc.check_id)
      JOIN [mtc_admin].[checkStatus] cs ON (chk.checkStatus_id = cs.id)
      WHERE
        prc.check_id IS NULL
      AND ((cs.code = 'CMP' AND chk.markedAt IS NOT NULL) OR cs.code = 'NTR')`
}

const psychometricianReportCacheDataService = {
  /**
   * Batch insert multiple objects
   * @param {Array.<object>} dataObjects
   * @return {Promise<{insertId: Array<number>, rowsModified: <number>}>}
   */
  sqlInsertMany: async function (dataObjects) {
    const insertSql = `
    DECLARE @output TABLE (id int);
    INSERT INTO [mtc_admin].[psychometricianReportCache]
    (check_id, jsonData)
    OUTPUT inserted.ID INTO @output
    VALUES
    `
    const output = '; SELECT * from @output'
    const values = []
    const params = []
    for (let i = 0; i < dataObjects.length; i++) {
      values.push(`(@checkId${i}, @data${i})`)
      params.push(
        {
          name: `checkId${i}`,
          value: dataObjects[i].check_id,
          type: TYPES.Int
        },
        {
          name: `data${i}`,
          value: JSON.stringify(dataObjects[i].jsonData),
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
    const sql = getUnprocessedChecksSql(batchSize)
    const results = await sqlService.query(sql)
    return results.map(r => r.id)
  },

  hasUnprocessedChecks: async function () {
    const sql = getUnprocessedChecksSql(1)
    const results = await sqlService.query(sql)
    if (results && results.length) {
      return true
    }
    return false
  },

  /**
   * Store details of a file uploaded to blob storage in the database
   * @param {string} container
   * @param {string} fileName
   * @param {string} etag
   * @param {Buffer} md5
   * @param {string} typeCode - azureBlobFileType.code
   * @return {Promise<void>}
   */
  sqlSaveFileUploadMeta: async function sqlSaveFileUploadMeta (container,
    fileName,
    etag,
    md5,
    typeCode) {
    const sql = `INSERT INTO [mtc_admin].[azureBlobFile] (container, etag, fileName, md5, azureBlobFileType_id)
                 VALUES (@container, @etag, @fileName, @md5,
                         (SELECT id from [mtc_admin].[azureBlobFileType] where code = @code))`
    const params = [
      { name: 'container', value: container, type: TYPES.VarChar },
      { name: 'fileName', value: fileName, type: TYPES.VarChar },
      { name: 'etag', value: etag, type: TYPES.VarChar },
      { name: 'md5', value: md5, type: TYPES.Binary },
      { name: 'code', value: typeCode, type: TYPES.VarChar }
    ]
    return sqlService.modify(sql, params)
  }
}

module.exports = psychometricianReportCacheDataService
