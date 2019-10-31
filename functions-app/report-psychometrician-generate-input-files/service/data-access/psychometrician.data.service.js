'use strict'
const csv = require('fast-csv')
const fs = require('fs-extra')
const R = require('ramda')

const sqlService = require('../../../lib/sql/sql.service')
// const { TYPES } = sqlService
const base = require('../../../lib/logger')
const dateService = require('../date.service')

const psychometricianDataService = {
  /**
   * Stream a report to disk
   * @param fileNameWithPath
   * @return {Promise}
   */
  streamReport: function (fileNameWithPath, sql) {
    return new Promise(async resolve => {
      const stream = fs.createWriteStream(fileNameWithPath, { mode: 0o600 })
      const csvStream = csv.createWriteStream({ headers: true })
      csvStream.pipe(stream)
      const request = await sqlService.getRequest()
      let rowCount = 0

      const recordSetFunc = () => {}

      const rowFunc = (row) => {
        const transformations = {
          checkCreatedAt: dateService.formatIso8601,
          markedAt: dateService.formatIso8601,
          pupilLoginDate: dateService.formatIso8601,
          checkReceivedByServerAt: dateService.formatIso8601,
          checkStartedAt: dateService.formatIso8601,
          dateOfBirth: dateService.formatUKDate,
          isLiveCheck: v => v ? 1 : 0
        }
        try {
          if (++rowCount % 5000 === 0) this.logger.info(`${rowCount} records streamed to disk`)
          const data = R.evolve(transformations, row)
          if (!csvStream.write(data)) {
            // Will pause every until `drain` event is emitted
            request.pause()
            csvStream.once('drain', function () { request.resume() })
          }
        } catch (error) {
          console.error(`streamReport(): [onRow]: Failed to write data for ${row.checkId}: ${error.message}`)
        }
      }

      const errorFunc = (error) => {
        console.error(`streamReport(): [onError]: error: ${error.message}`)
      }

      /**
       * Called when the sql has finished
       * @param data E.g. { output: {}, rowsAffected: [ 10000 ] }
       */
      const doneFunc = (data) => {
        csvStream.end(function () {
          stream.end(function () {
            console.log('streamReport(): file complete')
            resolve(data)
          })
        })
      }

      sqlService.streamQuery(recordSetFunc, rowFunc, errorFunc, doneFunc, sql, request)
    })
  }
}

module.exports = Object.assign(psychometricianDataService, base)
