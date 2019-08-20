'use strict'

const base = require('../../../lib/logger')
const config = require('../../config')
const mtcFsUtils = require('../../lib/mtc-fs-utils')

const functionName = 'data.service'

const dataService = {
  /**
   * Dump all data required to produce the entire psychometrician report
   * This will include check, pupil, checkForm, answers, school
   * @param {String} $tmpDirectory - the directory to store the staging files in
   *  For Unix this can be $TMP
   *  For Azure Functions running windows this should be the web server root
   * @return {Promise<void>}
   */
  dumpFiles: async function dumpFiles () {
    let newTmpDir

    try {
      newTmpDir = await mtcFsUtils.createTmpDir('PS-REPORT-EXTRACT-TEMP-', config.PsReportTemp)
      this.logger.info(`${functionName}: tmp directory created: ${newTmpDir}`)
    } catch (error) {
      this.logger.error(`${functionName}: Failed to created a new tmp directory: ${error.message}`)
      throw error // unrecoverable - no work can be done.
    }
  }
}

module.exports = Object.assign(dataService, base)
