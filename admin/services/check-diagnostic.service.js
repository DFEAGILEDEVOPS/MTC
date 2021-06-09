'use strict'

const dataService = require('./data-access/check-diagnostic.data.service')
const payloadService = require('./payload.service')

const service = {
  /**
   * @description looks up diagnostic check record by check code
   * @param {string} checkCode required, valid UUID
   * @returns single check record, or undefined if not found
   */
  getByCheckCode: function getByCheckCode (checkCode) {
    if (!checkCode) {
      throw new Error('checkCode is required')
    }
    return dataService.getByCheckCode(checkCode.trim())
  },

  compareResultsToPayload: async function compareResultsToPayload (checkCodes) {
    if (!Array.isArray(checkCodes)) {
      throw new Error('checkCodes array is required')
    }
    const promises = []
    for (let index = 0; index < checkCodes.length; index++) {
      const checkCode = checkCodes[index]
      promises.push(verifyResultsAgainstPayload(checkCode))
    }
    return Promise.all(promises)
  }
}

async function verifyResultsAgainstPayload (checkCode) {
  const data = await Promise.all([
    payloadService.getPayload(checkCode),
    dataService.getResultsQuestionsJsonByCheckCode(checkCode),
    dataService.getResultsAnswersJsonByCheckCode(checkCode)])
  const payload = data[0]
  const resultsQuestions = data[1]
  const resultsAnswers = data[2]
  const payloadQuestionsString = JSON.stringify(payload.questions)
  const payloadAnswersString = JSON.stringify(payload.answers)
  return [
    resultsQuestions,
    resultsAnswers,
    payloadQuestionsString,
    payloadAnswersString
  ]
}

module.exports = service
