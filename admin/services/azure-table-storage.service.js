const uuid = require('uuid')
const azureTableDataService = require('./data-access/azure-table.data.service')
const markedCheckTable = 'checkResult'
const checkReceivedTable = 'receivedCheck'
const moment = require('moment')

/**
 * @typedef {object} Answer
 * @property {number} factor1
 * @property {number} factor2
 * @property {string} answer
 * @property {number} sequenceNumber
 * @property {string} question e.g. 2x10
 * @property {moment.Moment} clientTimestamp - browser timestamp of when the answer was received
 * @property {boolean} [isCorrect] true if a mark was awarded, only valid for checkResult table, not in receivedCheck
 *
 */

/**
 * @typedef {object} MarkedCheckEntity
 * @property {string} partitionKey - valid UUID in lowercase
 * @property {string} rowKey - valid UUID in lowercase
 * @property {moment.Moment} timestamp
 * @property {number} mark
 * @property {number} maxMarks
 * @property {Answer[]} markedAnswers
 * @property {moment.Moment} markedAt timestamp of when the marked was performed
 *
 */

/**
 * @typedef {object} ReceivedCheckEntity
 * @property {string} partitionKey - valid UUID in lowercase
 * @property {string} rowKey - valid UUID in lowercase
 * @property {moment.Moment} timestamp
 * @property {moment.Moment} checkReceivedAt
 * @property {number} checkVersion
 * @property {boolean} isValid
 * @property {string} processingError
 * @property {moment.Moment} validatedAt
 * @property {Answer[] | null} answers
 *
 */

const azureTableStorageService = {
  /**
   * @description Hydrate an raw marked check from Azure Table Storage back into correct types
   * @param {object} rawMarkedCheck
   * @returns {MarkedCheckEntity}
   */
  hydrateMarkedCheck: function hydrateMarkedCheck (rawMarkedCheck) {
    const markedAnswers = JSON.parse(rawMarkedCheck.markedAnswers)
    if (Array.isArray(markedAnswers)) {
      markedAnswers.forEach(a => {
        a.clientTimestamp = moment(a.clientTimestamp)
      })
    }
    return {
      partitionKey: rawMarkedCheck.partitionKey,
      rowKey: rawMarkedCheck.rowKey,
      timestamp: moment(rawMarkedCheck.timestamp),
      mark: rawMarkedCheck.mark,
      maxMarks: rawMarkedCheck.maxMarks,
      markedAnswers,
      markedAt: moment(rawMarkedCheck.markedAt)
    }
  },

  /**
   * @description Hydrate a raw received check from Azure Table Storage into correct types
   * @param {object} rawReceivedCheck
   * @returns {ReceivedCheckEntity}
   */
  hydrateReceivedCheck: function hydrateReceivedCheck (rawReceivedCheck) {
    let answers = null
    if (rawReceivedCheck.answers !== null && rawReceivedCheck.answers !== undefined) {
      try {
        answers = JSON.parse(rawReceivedCheck.answers)
        answers.forEach(a => {
          a.clientTimestamp = moment(a.clientTimestamp)
        })
      } catch {
        // json decode error / ignore
      }
    }

    return {
      partitionKey: rawReceivedCheck.partitionKey,
      rowKey: rawReceivedCheck.rowKey,
      timestamp: moment(rawReceivedCheck.timestamp),
      checkReceivedAt: moment(rawReceivedCheck.checkReceivedAt),
      checkVersion: rawReceivedCheck.checkVersion,
      isValid: rawReceivedCheck.isValid,
      processingError: rawReceivedCheck.processingError,
      validatedAt: moment(rawReceivedCheck.validatedAt),
      answers
    }
  },

  /**
   * @description Returns a hydrated marked check entity or undefined if not found [tech-support role utility function]
   * @param {*} schoolUuid
   * @param {*} checkCode
   * @returns {Promise<MarkedCheckEntity | undefined>}
   */
  retrieveMarkedCheck: async function retrieveMarkedCheck (schoolUuid, checkCode) {
    if (!uuid.validate(schoolUuid)) {
      throw new Error('Invalid UUID given for school')
    }
    if (!uuid.validate(checkCode)) {
      throw new Error('Invalid UUID given for checkCode')
    }
    const entity = await azureTableDataService.retrieveEntity(markedCheckTable, schoolUuid.toLowerCase(), checkCode.toLowerCase())
    if (entity === undefined || entity === null) {
      return undefined
    }
    const hydratedEntity = azureTableStorageService.hydrateMarkedCheck(entity)
    return hydratedEntity
  },

  /**
   * @description Returns the received check (minus payload) or undefined if not found
   * @param {string} schoolUuid
   * @param {string} checkCode
   * @returns {Promise<ReceivedCheckEntity | undefined>}
   */
  retrieveReceivedCheck: async function retrieveReceivedCheck (schoolUuid, checkCode) {
    if (!uuid.validate(schoolUuid)) {
      throw new Error('Invalid UUID given for school')
    }
    if (!uuid.validate(checkCode)) {
      throw new Error('Invalid UUID given for checkCode')
    }
    const entity = await azureTableDataService.retrieveEntity(checkReceivedTable, schoolUuid.toLowerCase(), checkCode.toLowerCase())
    if (entity === undefined || entity === null) {
      return undefined
    }
    const hydratedEntity = azureTableStorageService.hydrateReceivedCheck(entity)
    return hydratedEntity
  }
}

module.exports = azureTableStorageService
