'use strict'
const sqlService = require('../../../lib/sql/sql.service')
const { TYPES } = sqlService
const csv = require('fast-csv')
const base = require('../../../lib/logger') // provides logger
const fs = require('fs-extra')

const psychometricianReportDataService = {
  /**
   * Stream the psychometrician report to file
   */
  streamPsychometricianReport: function streamPsychometricianReport (fileNameWithPath) {
    return new Promise( async resolve => {
      const stream = fs.createWriteStream(fileNameWithPath, { mode: 0o600 })
      const csvStream = csv.createWriteStream({ headers: true })
      csvStream.pipe(stream)
      const sql = 'SELECT check_id as checkId, jsonData from [mtc_admin].[psychometricianReportCache]'
      const request = await sqlService.getRequest()

      const recordSetFunc = () => {}

      const rowFunc = (row) => {
        try {
          const data = JSON.parse(row.jsonData)
          if (!csvStream.write(data)) {
            // Will pause every until `drain` event is emitted
            request.pause()
            csvStream.once('drain', function () { request.resume() } )
          }
        } catch (error) {
          this.logger.error(`streamPsychometricianReport(): [onRow]: Failed to write data for ${row.checkId}: ${error.message}`)
        }
      }

      const errorFunc = (error) => {
        this.logger.error('streamPsychometricianReport(): [onError]: error: ', error.message)
      }

      /**
       * Called when the sql has finished
       * @param data E.g. { output: {}, rowsAffected: [ 10000 ] }
       */
      const doneFunc = (data) => {
        csvStream.end(function () {
          resolve(data)
        })
      }

      await sqlService.streamQuery(recordSetFunc, rowFunc, errorFunc, doneFunc, sql, request)
    })
  },

  /**
   * Stream the anomaly report to a file
   * @param fileNameWithPath
   * @return {Promise}
   */
  streamAnomalyReport: async function (fileNameWithPath) {
    return new Promise( async resolve => {
      const stream = fs.createWriteStream(fileNameWithPath, { mode: 0o600 })
      const csvStream = csv.createWriteStream({ headers: true })
      csvStream.pipe(stream)
      const sql = 'SELECT check_id as checkId, jsonData from [mtc_admin].[anomalyReportCache]'
      const request = await sqlService.getRequest()

      const recordSetFunc = () => {}

      const rowFunc = (row) => {
        try {
          const data = JSON.parse(row.jsonData)
          if (!csvStream.write(data)) {
            // Will pause every until `drain` event is emitted
            request.pause()
            csvStream.once('drain', function () { request.resume() } )
          }
        } catch (error) {
          this.logger.error(`streamAnomalyReport(): [onRow]: Failed to write data for ${row.checkId}: ${error.message}`)
        }
      }

      const errorFunc = (error) => {
        this.logger.error('streamAnomalyReport(): [onError]: error: ', error.message)
      }

      /**
       * Called when the sql has finished
       * @param data E.g. { output: {}, rowsAffected: [ 10000 ] }
       */
      const doneFunc = (data) => {
        csvStream.end(function () {
          resolve(data)
        })
      }

      await sqlService.streamQuery(recordSetFunc, rowFunc, errorFunc, doneFunc, sql, request)
    })
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

module.exports = Object.assign(psychometricianReportDataService, base)
