'use strict'
const csv = require('fast-csv')
const fs = require('fs-extra')
const R = require('ramda')
const moment = require('moment')

const sqlService = require('../../../lib/sql/sql.service')
const base = require('../../../lib/logger')
const dateService = require('../../../lib/date.service')

const psychometricianDataService = {
  /**
   * Stream a report to disk
   * @param fileNameWithPath
   * @return {Promise}
   */
  streamReport: function (fileNameWithPath, sql) {
    return new Promise(async resolve => { // eslint-disable-line no-async-promise-executor
      const stream = fs.createWriteStream(fileNameWithPath, { mode: 0o600 })
      const csvStream = csv.format({ headers: true })
      csvStream.pipe(stream)
      const request = await sqlService.getRequest()
      let rowCount = 0

      const recordSetFunc = () => {}

      const rowFunc = (row) => {
        const transformations = {
          checkCreatedAt: (s) => { return s && dateService.formatIso8601(moment(s)) },
          pupilLoginDate: (s) => { return s && dateService.formatIso8601(moment(s)) },
          checkStartedAt: (s) => { return s && dateService.formatIso8601(moment(s)) },
          dateOfBirth: (s) => { return s && dateService.formatUKDate(moment(s)) },
          isLiveCheck: v => v ? 1 : 0
        }
        try {
          rowCount += 1
          if (rowCount % 5000 === 0) this.logger.info(`${rowCount} records streamed to disk`)
          const data = R.evolve(transformations, row)
          if (!csvStream.write(data)) {
            // Will pause every until `drain` event is emitted
            request.pause()
            csvStream.once('drain', function () {
              request.resume()
            })
          }
        } catch (error) {
          console.error(`streamReport(): [onRow]: Failed to write data for ${row.checkId}: ${error.message} for row ${JSON.stringify(row)}`, error)
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
        csvStream.end()
        console.log('streamReport(): doneFunc() called', data)
      }

      csvStream.on('end', function () {
        resolve()
      })

      csvStream.on('error', function (error) {
        console.error('csvStream error: ', error)
      })

      sqlService.streamQuery(recordSetFunc, rowFunc, errorFunc, doneFunc, sql, request)
    })
  }
}

module.exports = Object.assign(psychometricianDataService, base)
