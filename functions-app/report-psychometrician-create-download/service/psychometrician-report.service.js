'use strict'

const archiver = require('archiver')
const csv = require('fast-csv')
const moment = require('moment')
const uuidv4 = require('uuid/v4')
const os = require('os')
const fs = require('fs-extra')
const path = require('path')

const base = require('../../lib/base')

const azureFileDataService = require('./data-access/azure-file.data.service')
const psychometricianReportDataService = require('./data-access/psychometrician-report.data.service')

const psychometricianReportUploadContainer = 'psychometricianreportupload'
const psychometricianReportCode = 'PSR'
const functionName = 'report-psychometrician'

/**
 * Create a unique directory in the system's temp dir
 * @param prefix
 * @return {*}
 */
async function createTmpDir (prefix) {
  return fs.mkdtemp(`${os.tmpdir()}${path.sep}${prefix}`)
}

const psychometricianReportService = {
  /**
   * Creates a zip with the psychometricianReport and anomalyReport
   * @param {String} psychometricianReport
   * @param {String} anomalyReport
   * @param {Moment} dateGenerated
   * @return {Object}
   */
  generateZip: async function generateZip (psychometricianReport, anomalyReport, dateGenerated) {
    const archive = archiver('zip')
    // collect data from the zip stream since uploadBlobToStorage receives the entire blob
    const zipStreamChunks = []
    archive.on('data', (chunk) => {
      zipStreamChunks.push(chunk)
    })
    archive.append(psychometricianReport, { name: `Pupil check data ${dateGenerated.format('YYYY-MM-DD HH.mm.ss')}.csv` })
    archive.append(anomalyReport, { name: `Anomaly Report ${dateGenerated.format('YYYY-MM-DD HH.mm.ss')}.csv` })
    await archive.finalize()
    return Buffer.concat(zipStreamChunks)
  },

  /**
   * Upload stream to Blob Storage
   * @param uploadStream
   * @return {Promise<void>}
   */
  uploadToBlobStorage: async function uploadToBlobStorage (data) {
    const remoteFilename = `${uuidv4()}_${moment().format('YYYYMMDDHHmmss')}.zip`
    return azureFileDataService.azureUploadFile(psychometricianReportUploadContainer, remoteFilename, data, data.length)
  },

  /**
   * Return the CSV file as a string
   * @return {Promise<string>}
   */
  generatePsychometricianReport: async function generatePsychometricianReport (directory) {
    const baseFilename = 'psychometrician-report.csv'
    const fileNameWithPath = `${directory}${path.sep}${baseFilename}`
    await psychometricianReportDataService.setLogger(this.logger).streamPsychometricianReport(fileNameWithPath)
    console.log('PS Report ', fileNameWithPath)
    return fileNameWithPath
  },

  /**
   * Return the CSV file as a string
   * @return {Promise<void>}
   */
  generateAnomalyReport: async function generateAnomalyReport () {
    // Read data from the cache
    const results = await psychometricianReportDataService.sqlFindAllAnomalyReports()
    const output = []
    for (const obj of results) {
      output.push(obj.jsonData)
    }

    const headers = this.produceAnomalyReportDataHeaders()
    output.unshift(headers)

    return new Promise((resolve, reject) => {
      csv.writeToString(
        output,
        { headers: false },
        function (err, data) {
          if (err) { return reject(err) }
          resolve(data)
        }
      )
    })
  },

  /**
   * Generate and upload the psychometrician and anomaly reports in Zip format to Azure Storage
   * This is a lift and shift version: it needs to be updated
   * TODO: handle volume data
   * @return {Promise<void>}
   */
  process: async function process () {
    const dateGenerated = moment()

    // Create a temporary directory to stage the report files in
    let newTmpDir

    try {
      newTmpDir = await createTmpDir(functionName + '-')
      this.logger.info('created new tmp dir ', newTmpDir)
    } catch (error) {
      this.logger.error(`${functionName}: Failed to created a new tmp directory: ${error.message}`)
      throw error // unrecoverable - no work can be done.
    }

    const psychometricianReportFilename = await this.generatePsychometricianReport(newTmpDir)
    const anomalyReport = await this.generateAnomalyReport()
    // const zipFile = await this.generateZip(psychometricianReport, anomalyReport, dateGenerated)
    // const uploadBlob = await this.uploadToBlobStorage(zipFile)
    // const md5Buffer = Buffer.from(uploadBlob.contentSettings.contentMD5, 'base64')
    // await psychometricianReportDataService.sqlSaveFileUploadMeta(
    //   uploadBlob.container,
    //   uploadBlob.name,
    //   uploadBlob.etag,
    //   md5Buffer,
    //   psychometricianReportCode)
  },

  /**
   * Returns the CSV headers
   * @param {Array} results
   * @returns {Array}
   */
  producePsychometricianReportDataHeaders: function producePsychometricianReportDataHeaders (results) {
    // If there are no checks, there will be an empty file
    if (results.length === 0) return []
    // Fetch the first completed check to store the keys as headers
    const completedCheck = results.find(c => c.jsonData && c.jsonData.hasOwnProperty('Q1ID'))
    if (completedCheck) {
      return Object.keys(completedCheck.jsonData)
    }
    // Alternatively return the first check keys
    return Object.keys(results[0].jsonData)
  },

  /**
   * Returns the Anomaly CSV headers
   * @param {Array} results
   * @returns {Array}
   */
  produceAnomalyReportDataHeaders: function produceAnomalyReportDataHeaders () {
    const reportHeaders = [
      'Check Code',
      'Date',
      'Speech Synthesis',
      'Mark',
      'Device',
      'Agent',
      'Message',
      'Tested value',
      'Expected value',
      'Question number'
    ]

    return reportHeaders
  }
}

module.exports = Object.assign(base, psychometricianReportService)
