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
                     chk.id as checkId,
                     chk.checkCode,
                     chk.checkForm_id,
                     chk.checkWindow_id,
                     chk.createdAt as checkCreatedAt,
                     chk.isLiveCheck,
                     chk.mark,
                     chk.markedAt,
                     chk.maxMark,
                     chk.pupilLoginDate,
                     chk.receivedByServerAt as checkReceivedByServerAt,
                     chk.startedAt as checkStartedAt,
                     cr.payload as checkPayload,
                     cs.code as checkStatus,
                     cs.description as checkStatusDescription,
                     prr.code restartCode,
                     (
                         SELECT COUNT(id)
                         FROM [mtc_admin].[pupilRestart] pr
                         WHERE pr.pupil_id = chk.pupil_id
                           AND pr.createdAt < chk.createdAt
                           AND pr.isDeleted = 0
                     ) restartCount,
                     ac.code attendanceCode,
                     p.foreName,
                     p.middleNames,
                     p.lastName,
                     p.dateOfBirth,
                     p.upn,
                     (select
                          id,
                          check_id,
                          answer as response,
                          factor1,
                          factor2,
                          isCorrect,
                          questionNumber
                      from [mtc_admin].[answer]
                      where check_id = chk.id
                      order by questionNumber asc
                               for json path, root('answer')) as markedAnswers,
                     cw.id as checkWindowId,
                     cw.name as checkWindowName,
                     s.name as schoolName,
                     s.urn as schoolUrn,
                     s.estabCode as schoolEstabCode,
                     s.leaCode as schoolLeaCode,
                     cf.name as checkFormName

                 FROM [mtc_admin].[check] chk
                          JOIN      [mtc_admin].[checkForm] cf ON (chk.checkForm_id = cf.id)
                          JOIN      [mtc_admin].[checkStatus] cs ON (chk.checkStatus_id = cs.id)
                          JOIN      [mtc_admin].[checkWindow] cw ON (chk.checkWindow_id = cw.id)
                          JOIN      [mtc_admin].[pupil] p ON (chk.pupil_id = p.id)
                          JOIN      [mtc_admin].[pupilStatus] ps ON (p.pupilStatus_id = ps.id)
                          JOIN      [mtc_admin].[school] s ON (p.school_id = s.id)
                          LEFT JOIN [mtc_admin].[checkResult] cr ON (chk.id = cr.check_id)
                          LEFT JOIN [mtc_admin].[pupilAttendance] pa ON (pa.pupil_id = chk.pupil_id AND pa.isDeleted = 0)
                          LEFT JOIN [mtc_admin].[attendanceCode] ac ON (ac.id = pa.attendanceCode_id AND pa.isDeleted = 0)
                          LEFT JOIN [mtc_admin].[pupilRestart] pr ON (pr.check_id = chk.id AND pr.isDeleted = 0)
                          LEFT JOIN [mtc_admin].[pupilRestartReason] prr ON (prr.id = pr.pupilRestartReason_id)
                 WHERE chk.isLiveCheck = 1`
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
