'use strict'

const async = require('async')
const csv = require('fast-csv')
const fs = require('fs')
const path = require('path')
const R = require('ramda')
const uuidv4 = require('uuid/v4')
const moment = require('moment')

const azureFileDataService = require('../../lib/azure-file.data.service')
const azureStorageHelper = require('../../lib/azure-storage-helper')
const base = require('../../lib/logger')
const compressionService = require('../service/compression.service')
const config = require('../../config')
const mtcFsUtils = require('../../lib/mtc-fs-utils')
const psychometricianDataService = require('./data-access/psychometrician.data.service')

const functionName = 'ps-report-staging: data.service'

// https://docs.microsoft.com/en-us/rest/api/storageservices/Naming-and-Referencing-Containers--Blobs--and-Metadata
// Container names must be lowercase.
const blobUploadContainerName = 'ps-report-staging'

const dataService = {
  /**
   * Return the CSV filename with path as a string
   * @return {Promise<string>}
   */
  generateCheckDataForPsychometricianReport: async function generateCheckDataForPsychometricianReport (directory) {
    const baseFilename = 'ps-staging-1.csv'
    const fileNameWithPath = `${directory}${path.sep}${baseFilename}`
    const sql = `SELECT
                     chk.id AS checkId,
                     chk.checkCode,
                     chk.checkForm_id as checkFormId,
                     chk.createdAt AS checkCreatedAt,
                     chk.isLiveCheck,
                     chk.pupilLoginDate,
                     cs.code AS checkStatus,
                     cs.description AS checkStatusDescription,
                     prr.code AS restartCode,
                     (SELECT COUNT(id)
                        FROM [mtc_admin].[pupilRestart] pr
                       WHERE pr.pupil_id = chk.pupil_id
                         AND pr.createdAt < chk.createdAt
                         AND pr.isDeleted = 0) AS restartCount,
                     ac.code AS attendanceCode,
                     p.foreName,
                     p.middleNames,
                     p.lastName,
                     p.dateOfBirth,
                     p.upn,
                     p.gender,
                     cw.id AS checkWindowId,
                     cw.name AS checkWindowName,
                     s.name AS schoolName,
                     s.urn AS schoolUrn,
                     s.estabCode AS schoolEstabCode,
                     s.leaCode AS schoolLeaCode,
                     s.urlSlug as schoolGuid,
                     cf.name AS checkFormName

                   FROM [mtc_admin].[pupil] p
                        JOIN      [mtc_admin].[school] s ON (p.school_id = s.id)
                        LEFT JOIN [mtc_admin].[check] chk ON (p.currentCheckId = chk.id)
                        LEFT JOIN [mtc_admin].[checkForm] cf ON (chk.checkForm_id = cf.id)
                        LEFT JOIN [mtc_admin].[checkStatus] cs ON (chk.checkStatus_id = cs.id)
                        LEFT JOIN [mtc_admin].[checkWindow] cw ON (chk.checkWindow_id = cw.id)
                        LEFT JOIN [mtc_admin].[attendanceCode] ac ON (p.attendanceId = ac.id)
                        LEFT JOIN [mtc_admin].[pupilRestart] pr ON (pr.check_id = chk.id AND pr.isDeleted = 0)
                        LEFT JOIN [mtc_admin].[pupilRestartReason] prr ON (prr.id = pr.pupilRestartReason_id)
                  WHERE p.attendanceId IS NOT NULL
                     OR p.checkComplete = 1;`
    psychometricianDataService.setLogger(this.logger)
    await psychometricianDataService.streamReport(fileNameWithPath, sql)
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
  dumpStage1File: async function dumpStage1File () {
    let newTmpDir

    try {
      newTmpDir = await mtcFsUtils.createTmpDir('PS-STAGE-1-', config.PsReportTemp)
      this.logger.info(`${functionName}: tmp directory created: ${newTmpDir}`)
    } catch (error) {
      this.logger.error(`${functionName}: failed to created a new tmp directory: ${error.message}`)
      throw error // unrecoverable - no work can be done.
    }

    // Dump the main file
    const file = await this.generateCheckDataForPsychometricianReport(newTmpDir)
    this.logger.info(`${functionName}: data dumped to ${file}`)
    return file
  },

  transformMarkingData: function transformMarkingData (markingData) {
    const sorted = R.sortBy(R.prop('sequenceNumber'), markingData)
    return R.map(o => {
      return {
        questionNumber: o.sequenceNumber,
        response: o.answer,
        factor1: o.factor1,
        factor2: o.factor2,
        isCorrect: o.isCorrect === true ? 1 : 0
      }
    }, sorted)
  },

  writeStage2File: function writeStage2File (stage1Filename) {
    return new Promise(async (resolve, reject) => { // eslint-disable-line no-async-promise-executor
      let newTmpDir

      try {
        newTmpDir = await mtcFsUtils.createTmpDir('PS-STAGE-2-', config.PsReportTemp)
        this.logger.info(`${functionName}: tmp directory created: ${newTmpDir}`)
      } catch (error) {
        this.logger.error(`${functionName}: Failed to created a new tmp directory: ${error.message}`)
        return reject(error) // unrecoverable - no work can be done.
      }
      const fileNameWithPath = `${newTmpDir}${path.sep}ps-stage-2.csv`
      let writeStream
      try {
        writeStream = fs.createWriteStream(fileNameWithPath, { mode: 0o600 })
      } catch (error) {
        return reject(error)
      }

      const csvWriteStream = csv.format({ headers: true })
      csvWriteStream.pipe(writeStream)
      const azureTableService = azureStorageHelper.getPromisifiedAzureTableService()
      const checkReceivedTable = 'receivedCheck'
      const markingTable = 'checkResult'

      /**
       * Mutate `data` with additional properties looked up from Table Storage
       * Properties added: checkPayload, checkReceivedByServerAt, mark, markedAt, maxMark, markedAnswers
       * @param {object} data
       * @return {Promise<void>}
       */
      async function worker (data) {
        let tableStorageData

        if (data.checkCode) { // condition as some pupils may not have taken checks
          try {
            tableStorageData = await async.parallel({
              marking: async () => azureTableService.retrieveEntityAsync(markingTable, data.schoolGuid, data.checkCode),
              payload: async () => azureTableService.retrieveEntityAsync(checkReceivedTable, data.schoolGuid, data.checkCode)
            })
          } catch (error) {
            console.error(`writeStage2File() worker Lookup failed for checkCode [${data.checkCode}]`, error)
          }
          try {
            const archive = R.path(['payload', 'result', 'archive', '_'], tableStorageData)
            if (archive.length > 0) {
              const decompressedString = compressionService.decompress(archive)
              data.checkPayload = decompressedString
            }
            data.checkReceivedByServerAt = R.pathOr('', ['payload', 'result', 'checkReceivedAt', '_'], tableStorageData)
          } catch (error) {
            console.error('worker() Failed lookups', error)
            throw error
          }

          const entity = R.pathOr([{}], ['marking', 'result'], tableStorageData)

          try {
            const markingData = JSON.parse(R.path(['markedAnswers', '_'], entity))
            const answerData = dataService.transformMarkingData(markingData)
            data.mark = R.path(['mark', '_'], entity)
            data.markedAt = R.path(['markedAt', '_'], entity)
            data.maxMark = R.path(['maxMarks', '_'], entity)
            data.markedAnswers = JSON.stringify(answerData)
          } catch (error) {
            this.logger.error(`${functionName} : ERROR : failed to parse: ${JSON.stringify(entity)}`)
          }
        } else {
          data.mark = ''
          data.markedAt = ''
          data.maxMark = ''
          data.markedAnswers = ''
          data.checkPayload = ''
          data.checkReceivedByServerAt = ''
        }

        // Write the data, which is now populated with additional entities, to csv file
        if (!csvWriteStream.write(data)) {
          csvWriteStream.pause()
          csvWriteStream.once('drain', function () {
            csvWriteStream.resume()
          })
        }
      } // end worker()

      const readStream = fs.createReadStream(stage1Filename)
      const concurrency = 32 // TODO: make this a config variable so we can fine tune in load-test env
      const streamQueue = async.queue(worker, concurrency)

      csv
        .parseStream(readStream, { headers: true, objectMode: true })
        .on('error', error => console.error(error))
        .on('data', row => streamQueue.push(row))
        .on('end', rowCount => {
          this.logger.info(`Parsed ${rowCount} rows`)
          if (!streamQueue.started) {
            csvWriteStream.end(() => {
              resolve(fileNameWithPath)
            })
          } else {
            streamQueue.drain(function () {
              csvWriteStream.end(() => {
                resolve(fileNameWithPath)
              })
            })
          }
        })
    })
  },

  /**
   * Upload file to Blob Storage
   * @param localFilenameWithPath
   * @return {Promise<{container:  string, name: string}>}
   */
  uploadToBlobStorage: async function uploadToBlobStorage (localFilenameWithPath) {
    console.log(`${functionName}: uploadToBlobStorage() called`)
    const name = `${uuidv4()}_${moment().format('YYYYMMDDHHmmss')}`
    const remoteFilename = `${name}.csv`
    const properties = await azureFileDataService.azureUploadFromLocalFile(blobUploadContainerName, remoteFilename, localFilenameWithPath)

    // We also need to upload a small trigger file that contains the details of the file
    // This kicks off the ps-report process
    const remoteTriggerFileName = `${name}.trigger.json`
    await azureFileDataService.azureCreateBlobFromText(blobUploadContainerName, remoteTriggerFileName, JSON.stringify(properties))
    return properties
  }
}

module.exports = Object.assign(dataService, base)
