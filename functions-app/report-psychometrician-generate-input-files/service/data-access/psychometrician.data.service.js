'use strict'
const csv = require('fast-csv')
const fs = require('fs-extra')

const sqlService = require('../../../lib/sql/sql.service')
// const { TYPES } = sqlService
const base = require('../../../lib/logger')

const psychometricianDataService = {
  /**
   * Stream a report to disk
   * @param fileNameWithPath
   * @return {Promise}
   */
  streamReport: async function (fileNameWithPath, sql) {
    return new Promise(async resolve => {
      const stream = fs.createWriteStream(fileNameWithPath, { mode: 0o600 })
      const csvStream = csv.createWriteStream({ headers: true })
      csvStream.pipe(stream)
      const request = await sqlService.getRequest()

      const recordSetFunc = () => {}

      const rowFunc = (row) => {
        console.log('row is being written', row)
        try {
          if (!csvStream.write(row)) {
            // Will pause every until `drain` event is emitted
            request.pause()
            csvStream.once('drain', function () { request.resume() })
          }
        } catch (error) {
          this.logger.error(`streamReport(): [onRow]: Failed to write data for ${row.checkId}: ${error.message}`)
        }
      }

      const errorFunc = (error) => {
        this.logger.error(`streamReport(): [onError]: error: ${error.message}`)
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

      sqlService.streamQuery(recordSetFunc, rowFunc, errorFunc, doneFunc, sql, request)
    })
  }
}

module.exports = Object.assign(psychometricianDataService, base)
