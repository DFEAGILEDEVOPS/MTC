'use strict'

const base = require('../../lib/logger')
const config = require('../../config')
const mtcFsUtils = require('../../lib/mtc-fs-utils')
const psychometricianDataService = require('./data-access/psychometrician.data.service')

const functionName = 'data.service'

const dataService = {
  /**
   * Return the CSV file as a string
   * @return {Promise<string>}
   */
  generateCheckDataForPsychometricianReport: async function generateCheckDataForPsychometricianReport (directory) {
    const baseFilename = `custom-check-data.csv`
    const fileNameWithPath = `${directory}${path.sep}${baseFilename}`
    const sql = `SELECT
                      chk.*,
                      cr.payload,
                      cs.code,
                      cs.description,
                      prr.code restartCode,
                      (
                          SELECT COUNT(id)
                          FROM [mtc_admin].[pupilRestart] pr
                          WHERE pr.pupil_id = chk.pupil_id
                            AND pr.createdAt < chk.createdAt
                            AND pr.isDeleted = 0
                      ) restartCount,
                      ac.code attendanceCode
                  FROM [mtc_admin].[check] chk
                       LEFT JOIN [mtc_admin].[checkResult] cr ON (chk.id = cr.check_id)
                       LEFT JOIN [mtc_admin].[pupilRestart] pr ON (pr.check_id = chk.id AND pr.isDeleted = 0)
                       LEFT JOIN [mtc_admin].[pupilRestartReason] prr ON (prr.id = pr.pupilRestartReason_id)
                       LEFT JOIN [mtc_admin].[pupilAttendance] pa ON (pa.pupil_id = chk.pupil_id AND pa.isDeleted = 0)
                       LEFT JOIN [mtc_admin].[attendanceCode] ac ON (ac.id = pa.attendanceCode_id AND pa.isDeleted = 0)
                       JOIN [mtc_admin].[checkStatus] cs ON (chk.checkStatus_id = cs.id)`
    await psychometricianDataService.setLogger(this.logger).streamReport(fileNameWithPath, sql)
    return fileNameWithPath
  },
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

    // Dump the main file
    const file = await this.generateCheckDataForPsychometricianReport(newTmpDir)
  }
}

module.exports = Object.assign(dataService, base)
