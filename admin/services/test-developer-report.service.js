'use strict'

const psychometricianReportDataService = require('./data-access/psychometrician-report.data.service')
const azureFileDataService = require('./data-access/azure-file.data.service')

const testDeveloperReportService = {
  /**
   * Return the database record / meta information for the latest psychometrician report
   * @return {Promise<*|Promise<*>>}
   */
  getUploadedFile: async function getUploadedFile () {
    return psychometricianReportDataService.getLatest()
  },

  /**
   * Get existing psychometrician report file
   * @return {Object}
   */
  downloadFile: async function downloadFile (container, fileName, stream) {
    return azureFileDataService.azureDownloadFileStream(container, fileName, stream)
  }
}

module.exports = testDeveloperReportService
