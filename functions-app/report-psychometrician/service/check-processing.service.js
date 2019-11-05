'use strict'
const csv = require('fast-csv')
const fs = require('fs-extra')
const path = require('path')
const R = require('ramda')
const RA = require('ramda-adjunct')
const { performance } = require('perf_hooks')

const anomalyFileReportService = require('./anomaly-file-report.service')
const anomalyReportService = require('./anomaly-report.service')
const config = require('../../config')
const mtcFsUtils = require('../../lib/mtc-fs-utils')
const psychometricianReportDataService = require('./data-service/psychometrician-report-cache.data.service')
const psychometricianReportService = require('./psychometrician-report.service')

const checkProcessingService = {}
const functionName = 'psychometricReport'

/**
 * Get checks ids that will be used to cache psychometrician report data
 * @param {Number} batchSize
 * @param {logger} Function execution logger
 * @deprecated
 * @returns {{processCount}}
 */
checkProcessingService.cachePsychometricanReportData = async function (batchSize, logger) {
  if (!batchSize) {
    throw new Error('Missing batchSize parameter')
  }

  const batchIds = await psychometricianReportDataService.sqlFindUnprocessedStartedChecks(batchSize)

  if (!batchIds) {
    throw new Error('checkProcessingService.cachePsychometricanReportData: failed to retrieve any IDs')
  }

  if (!Array.isArray(batchIds)) {
    throw new Error('batchIds is not an Array')
  }

  if (batchIds.length > 0) {
    try {
      // Produce and cache the Psychometrician data
      await psychometricianReportService.batchProduceCacheData(batchIds, logger)

      // Produce and cache the Anomaly report data
      await anomalyReportService.batchProduceCacheData(batchIds, logger)
    } catch (error) {
      logger.error('ERROR: checkProcessingService.cachePsychometricanReportData: ' + error.message)
      throw error
    }
  } else {
    logger('psychometrician-report: no work to do')
  }

  return {
    processCount: batchIds.length
  }
}

/**
 * @deprecated
 * @return {Promise<*>}
 */
checkProcessingService.hasWorkToDo = async function hasWorkToDo () {
  return psychometricianReportDataService.hasUnprocessedChecks()
}

/**
 * Filter out arrays of undefined etc
 */
checkProcessingService.filterNils = R.filter(RA.isNotNilOrEmpty)

/**
 *
 * @param inputStream
 * @param csvStream
 * @param {Object} data
 * @return {Promise<void>}
 */
checkProcessingService.writeCsv = async function writeCsv (inputStream, csvStream, data) {
  try {
    if (!csvStream.write(data)) {
      // Will pause every until `drain` event is emitted
      inputStream.pause()
      csvStream.once('drain', function () { inputStream.resume() })
    }
  } catch (error) {
    this.logger.error(`streamReport(): [onRow]: Failed to write data: ${error.message}`)
  }
}

/**
 * Read the input file line by line and output the ps and anomaly reports as we go.
 * @param logger
 * @param filename
 * @return {Promise<unknown>}
 */
checkProcessingService.generateReportsFromFile = async function (logger, filename) {
  const meta = { errorCount: 0, processCount: 0 }
  const start = performance.now()

  // Get the parser for later use
  const parser = csv.parse({ headers: true })

  // Create a tmp dir to house the two output files
  let newTmpDir
  try {
    newTmpDir = await mtcFsUtils.createTmpDir('PS-REPORT-OUTPUT-V2-', config.PsReportTemp)
    logger.info(`${functionName}: tmp directory created: ${newTmpDir}`)
  } catch (error) {
    logger.error(`${functionName}: Failed to created a new tmp directory: ${error.message}`)
    throw error // unrecoverable - no work can be done.
  }

  // Azure!? - check the directory actually exists
  await mtcFsUtils.validateDirectory(newTmpDir)

  // Create two write streams for our output files
  const anomalyOutputStream = fs.createWriteStream(path.join(newTmpDir, 'anomalyReport.csv'), { mode: 0o600 })
  const psReportOutputStream = fs.createWriteStream(path.join(newTmpDir, 'psychometricReport.csv'), { mode: 0o600 })
  // ... and 2 CSV streams to pipe into them
  const anomalyCsvStream = csv.format({ headers: true })
  const psReportCsvStream = csv.format({ headers: true })
  psReportCsvStream.pipe(psReportOutputStream)
  anomalyCsvStream.pipe(anomalyOutputStream)
  let anomalyEndDetected = false
  let psReportEndDetected = false

  function waitForEnd (predicate, cb) {
    if (predicate()) {
      cb()
    } else {
      setTimeout(waitForEnd, 250, predicate, cb)
    }
  }

  return new Promise((resolve, reject) => {
    // Open the input file for reading
    const inputStream = fs.createReadStream(filename)
      .on('error', error => {
        console.error(`${functionName}: Error reading CSV: ${error}`)
        psReportCsvStream.end()
        anomalyCsvStream.end()
        reject(error)
      })

    // read the csv
    inputStream
      .pipe(parser)
      .on('data', row => {
        try {
          /** @type Object */
          const psData = psychometricianReportService.produceReportDataV2(row)
          checkProcessingService.writeCsv(inputStream, psReportCsvStream, psData)
          /** @type Array */
          const rawAnomalyData = anomalyFileReportService.detectAnomalies(row, logger)
          const anomalyData = checkProcessingService.filterNils(rawAnomalyData)

          anomalyData.forEach(data => {
            if (RA.isArray(data)) {
              data.forEach(innerData => {
                checkProcessingService.writeCsv(inputStream, anomalyCsvStream, innerData)
              })
            } else {
              checkProcessingService.writeCsv(inputStream, anomalyCsvStream, data)
            }
          })
          meta.processCount += 1
        } catch (error) {
          console.error(`${functionName} ERROR producing report data: ${error}`)
          console.error(error)
          meta.errorCount += 1
        }
      })
      .on('error', error => {
        logger.error(error)
        meta.errorCount += 1
      })
      .on('end', row => {
        const end = performance.now()
        const durationInMinutes = Math.floor((end - start) / 1000)
        psReportCsvStream.end()
        anomalyCsvStream.end()
        meta.durationInMins = Math.floor(durationInMinutes / 1000)
      })

    anomalyCsvStream.on('end', function () {
      anomalyEndDetected = true
    })

    psReportCsvStream.on('end', function () {
      psReportEndDetected = true
      waitForEnd(() => anomalyEndDetected && psReportEndDetected, () => { resolve(meta) })
    })
  })
}

module.exports = checkProcessingService
