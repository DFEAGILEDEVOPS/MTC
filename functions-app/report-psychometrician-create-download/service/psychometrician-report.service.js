'use strict'

const fs = require('fs-extra')
const moment = require('moment')

const path = require('path')
const R = require('ramda')
const uuidv4 = require('uuid/v4')

const azureFileDataService = require('./data-access/azure-file.data.service')

const base = require('../../lib/logger')
const config = require('../../config')
const psychometricianReportDataService = require('./data-access/psychometrician-report.data.service')
const zipper = require('./zip.service')
const mtcFsUtils = require('../../lib/mtc-fs-utils')

const psychometricianReportUploadContainer = 'psychometricianreportupload'
const psychometricianReportCode = 'PSR'
const functionName = 'report-psychometrician'

const psychometricianReportService = {
  /**
   * Delete a directory and its contents
   * @param directoryPath
   * @return {Promise<*>}
   */
  cleanup: async function cleanup (directoryPath) {
    this.logger.verbose(`Cleanup is deleting staging directory: ${directoryPath}`)
    return fs.remove(directoryPath)
  },

  /**
   * Upload stream to Blob Storage
   * @param uploadStream
   * @return {Promise<void>}
   */
  uploadToBlobStorage: async function uploadToBlobStorage (localFilenameWithPath) {
    const remoteFilename = `${uuidv4()}_${moment().format('YYYYMMDDHHmmss')}.zip`
    return azureFileDataService.azureUploadFromLocalFile(psychometricianReportUploadContainer, remoteFilename, localFilenameWithPath)
  },

  /**
   * Return the CSV file as a string
   * @return {Promise<string>}
   */
  generatePsychometricianReport: async function generatePsychometricianReport (directory) {
    const baseFilename = `Pupil check data ${moment().format('YYYY-MM-DD HH.mm.ss')}.csv`
    const fileNameWithPath = `${directory}${path.sep}${baseFilename}`
    const sql = 'SELECT check_id as checkId, jsonData from [mtc_admin].[psychometricianReportCache]'
    await psychometricianReportDataService.setLogger(this.logger).streamReport(fileNameWithPath, sql)
    return fileNameWithPath
  },

  /**
   * Return the CSV file as a string
   * @return {Promise<string>}
   */
  generateAnomalyReport: async function generateAnomalyReport (directory) {
    const baseFilename = `Anomaly report ${moment().format('YYYY-MM-DD HH.mm.ss')}.csv`
    const fileNameWithPath = `${directory}${path.sep}${baseFilename}`
    const sql = 'SELECT check_id as checkId, jsonData from [mtc_admin].[anomalyReportCache]'
    await psychometricianReportDataService.setLogger(this.logger).streamReport(fileNameWithPath, sql)
    return fileNameWithPath
  },

  /**
   * Generate and upload the psychometrician and anomaly reports in Zip format to Azure Storage
   * @return {Promise<void>}
   */
  process: async function process () {
    // Create a temporary directory to stage the report files in
    let newTmpDir, psychometricianReportFilename, anomalyReportFilename

    try {
      newTmpDir = await mtcFsUtils.createTmpDir('PS-REPORT-TEMP-', config.PsReportTemp)
      this.logger.info(`${functionName}: tmp directory created: ${newTmpDir}`)
    } catch (error) {
      this.logger.error(`${functionName}: Failed to created a new tmp directory: ${error.message}`)
      throw error // unrecoverable - no work can be done.
    }

    await mtcFsUtils.validateDirectory(newTmpDir)

    // This returns the full path + filename of the ps report
    try {
      this.logger(`Generating psychometrician report...`)
      psychometricianReportFilename = await this.generatePsychometricianReport(newTmpDir)
      this.logger(`Generating psychometrician report: done`)
    } catch (error) {
      this.logger.error(`${functionName}: Failed to generate psychometrician report: ${error.message}`)
      throw error
    }

    const filesToZip = []
    const psStat = await fs.stat(psychometricianReportFilename)
    filesToZip.push(psychometricianReportFilename)
    this.logger.verbose(`${functionName}: psychometrician report size: ${Math.round(psStat.size / 1024 / 1024)} MB`)

    // This returns the full path + filename of the anomaly report
    try {
      anomalyReportFilename = await this.generateAnomalyReport(newTmpDir)
    } catch (error) {
      this.logger.error(`${functionName}: Failed to generate anomaly report: ${error.message}`)
      throw error
    }

    try {
      const arStat = await fs.stat(anomalyReportFilename)
      this.logger.verbose(`${functionName}: anomaly report size: ${Math.round(arStat.size / 1024 / 1024)} MB`)
      filesToZip.push(anomalyReportFilename)
    } catch (error) {
      // Anomaly report may not have been produced if there weren't any anomalies
      this.logger.info(`${functionName}: failed to stat ${anomalyReportFilename}: ${error.message}`)
    }

    const zipFilename = `pupil-check-data-${moment().format('YYYY-MM-DD HHmm')}.zip`
    const zipFilenameWithPath = await zipper.createZip(zipFilename, filesToZip)
    const zipStat = await fs.stat(zipFilenameWithPath)
    this.logger.verbose(`${functionName}: ZIP archive size: ${Math.round(zipStat.size / 1024 / 1024)} MB`)

    // Upload to Azure Storage
    try {
      const blobProperties = await this.uploadToBlobStorage(zipFilenameWithPath)
      this.logger(`${functionName}: uploaded '${blobProperties.name}' to '${psychometricianReportUploadContainer}' container`)
      const base64MD5 = R.path(['contentSettings', 'contentMD5'], blobProperties)
      if (base64MD5) {
        const md5 = Buffer.from(base64MD5, 'base64')
        await psychometricianReportDataService.sqlSaveFileUploadMeta(
          blobProperties.container,
          blobProperties.name,
          blobProperties.etag,
          md5,
          psychometricianReportCode)
      } else {
        this.logger.error(`${functionName}: ERROR: unable to upload the blob details to the SQL DB.  Returned blobProperties was ${JSON.stringify(blobProperties)}`)
      }
    } catch (error) {
      this.logger.error(`Failed to upload to azure Storage: ${error.message}`)
    }

    try {
      await this.cleanup(newTmpDir)
    } catch (error) {
      this.logger.warn(`${functionName}: error in cleanup (ignored): ${error.message}`)
    }
  }
}

module.exports = Object.assign(psychometricianReportService, base)
