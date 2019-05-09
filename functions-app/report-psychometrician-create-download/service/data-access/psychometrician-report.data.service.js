'use strict'
const sqlService = require('../../../lib/sql/sql.service')
const R = require('ramda')
const { TYPES } = sqlService
const csv = require('fast-csv')
const base = require('../../../lib/base')
const fs = require('fs-extra')

const psychometricianReportDataService = {
  /**
   *
   */
  streamPsychometricianReport: function streamPsychometricianReport (fileNameWithPath, logger) {
    return new Promise(async resolve => {
      const stream = fs.createWriteStream(fileNameWithPath, { mode: 0o600 })
      const csvStream = csv.createWriteStream({ headers: true })
      csvStream.pipe(stream)
      const sql = 'SELECT check_id as checkId, jsonData from [mtc_admin].[psychometricianReportCache]'
      const request = await sqlService.getRequest()

      const recordSetFunc = () => {}

      let rowCount = 0
      const rowFunc = async (row) => {
        try {
          const data = JSON.parse(row.jsonData)
          csvStream.write(data)
          if (++rowCount % 15 === 0) {
            request.pause()
          }
        } catch (error) {
          if (error) {
            logger.error(`streamPsychometricianReport(): [onRow]: Failed to write data for ${row.checkId}: ${error.message}`)
          }
        }
      }

      const errorFunc = (error) => {
        logger.error('streamPsychometricianReport(): [onError]: error: ', error.message)
      }

      const doneFunc = () => {
        csvStream.end()
        stream.end()
        resolve({
          processCount: rowCount
        })
      }

      await sqlService.streamQuery(recordSetFunc, rowFunc, errorFunc, doneFunc, sql, request)
    })
  },

  sqlFindAllPsychometricianReports: async function sqlFindAllPsychometricianReports () {
    const sql = 'SELECT * from [mtc_admin].[psychometricianReportCache]'
    const results = await sqlService.query(sql)
    const parsed = results.map(x => {
      const d = JSON.parse(x.jsonData)
      return R.assoc('jsonData', d, x)
    })
    return parsed
  },

  sqlFindAllAnomalyReports: async function sqlFindAllPsychometricianReports () {
    const sql = 'SELECT * from [mtc_admin].[anomalyReportCache]'
    const results = await sqlService.query(sql)
    const parsed = results.map(x => {
      const d = JSON.parse(x.jsonData)
      return R.assoc('jsonData', d, x)
    })
    return parsed
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
  sqlSaveFileUploadMeta: async function storeFileUploadMetaInDb (container,
    fileName,
    etag,
    md5,
    typeCode) {
    const sql = `INSERT INTO [mtc_admin].[azureBlobFile] (container, etag, fileName, md5, azureBlobFileType_id)
                 VALUES
                 (@container, @etag, @fileName, @md5, (SELECT id from [mtc_admin].[azureBlobFileType] where code = @code))`
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

module.exports = Object.assign(base, psychometricianReportDataService)
