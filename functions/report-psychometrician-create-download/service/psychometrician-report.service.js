'use strict'

const archiver = require('archiver')
const csv = require('fast-csv')
const moment = require('moment')
const uuidv4 = require('uuid/v4')

const azureFileDataService = require('./data-access/azure-file.data.service')
const psychometricianReportDataService = require('./data-access/psychometrician-report.data.service')

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
    return azureFileDataService.azureUploadFile('psychometricianreportupload', remoteFilename, data, data.length)
  },

  /**
   * Return the CSV file as a string
   * @return {Promise<void>}
   */
  generatePsychometricianReport: async function generatePsychometricianReport () {
    // Read data from the cache
    const results = await psychometricianReportDataService.sqlFindAllPsychometricianReports()
    const output = []
    for (const obj of results) {
      output.push(obj.jsonData)
    }
    const headers = this.producePsychometricianReportDataHeaders(results)

    return new Promise((resolve, reject) => {
      csv.writeToString(
        output,
        { headers: headers },
        function (err, data) {
          if (err) { return reject(err) }
          resolve(data)
        }
      )
    })
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

  process: async function process () {
    const dateGenerated = moment()
    const psychometricianReport = await this.generatePsychometricianReport()
    const anomalyReport = await this.generateAnomalyReport()
    const zipFile = await this.generateZip(psychometricianReport, anomalyReport, dateGenerated)
    const blobResult = await this.uploadToBlobStorage(zipFile)
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
    const completedCheck = results.find(c => c.jsonData.hasOwnProperty('Q1ID'))
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

module.exports = psychometricianReportService
