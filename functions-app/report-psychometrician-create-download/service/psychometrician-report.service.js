'use strict'

const csv = require('fast-csv')
const fs = require('fs-extra')
const moment = require('moment')
const os = require('os')
const path = require('path')
const uuidv4 = require('uuid/v4')

const azureFileDataService = require('./data-access/azure-file.data.service')
const base = require('../../lib/base')
const psychometricianReportDataService = require('./data-access/psychometrician-report.data.service')
const zipper = require('./zipper')

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
   * Delete a directory and its contents
   * @param directoryPath
   * @return {Promise<*>}
   */
  cleanup: async function cleanup (directoryPath) {
    this.logger(`Cleanup is deleting staging directory: ${directoryPath}`)
    return fs.remove(directoryPath)
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
   * @return {Promise<void>}
   */
  process: async function process () {

    // Create a temporary directory to stage the report files in
    let newTmpDir, psychometricianReportFilename

    try {
      newTmpDir = await createTmpDir(functionName + '-')
      this.logger.debug(`${functionName}: tmp directory created: ${newTmpDir}`)
    } catch (error) {
      this.logger.error(`${functionName}: Failed to created a new tmp directory: ${error.message}`)
      throw error // unrecoverable - no work can be done.
    }

    // This returns the full path + filename of the ps report
    try {
      psychometricianReportFilename = await this.generatePsychometricianReport(newTmpDir)
    } catch (error) {
      this.logger.error(`${functionName}: Failed to generate psychometrician report: ${error.message}`)
      throw error
    }

    const psStat = await fs.stat(psychometricianReportFilename)
    this.logger.debug(`${functionName}: psychometrician report size: ${Math.round(psStat.size / 1024 / 1024)} MB`)

    const zipfileName = 'report.zip'
    const zipFileNameWithPath = await zipper.createZip(zipfileName, psychometricianReportFilename)

    const zipStat = await fs.stat(zipFileNameWithPath)
    this.logger.debug(`${functionName}: ZIP archive size: ${Math.round(zipStat.size / 1024 / 1024)} MB`)

    // const uploadBlob = await this.uploadToBlobStorage(zipFile)
    // const md5Buffer = Buffer.from(uploadBlob.contentSettings.contentMD5, 'base64')
    // await psychometricianReportDataService.sqlSaveFileUploadMeta(
    //   uploadBlob.container,
    //   uploadBlob.name,
    //   uploadBlob.etag,
    //   md5Buffer,
    //   psychometricianReportCode)

    try {
      await this.cleanup(newTmpDir)
    } catch (error) {
      this.logger.error(`${functionName}: error in cleanup (ignored): ${error.message}`)
    }
  },

  /**
   * Returns the CSV headers
   * @param {Array} results
   * @deprecated
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

module.exports = Object.assign(psychometricianReportService, base)
