'use strict'

const moment = require('moment')
const winston = require('winston')
const completedCheckDataService = require('./data-access/completed-check.data.service')
const checkDataService = require('./data-access/check.data.service')
const markingService = {}

markingService.batchMark = async function (batchIds) {
  if (!batchIds) {
    throw new Error('Missing arg batchIds')
  }
  if (!batchIds.length) {
    throw new Error('No documents to mark')
  }

  const completedChecks = await completedCheckDataService.sqlFindByIds(batchIds)

  for (let cc of completedChecks) {
    try {
      await this.mark(cc)
    } catch (error) {
      winston.error('Error marking document: ', error)
      // We can ignore this error and re-try the document again.
      // ToDo: add a count to the document of the number of processing attempts?
    }
  }
}

markingService.mark = async function (completedCheck) {
  if (!(completedCheck && completedCheck.data && completedCheck.data.answers)) {
    throw new Error('missing or invalid argument')
  }

  const results = {
    marks: 0,
    maxMarks: completedCheck.data.answers.length,
    // TODO date service?
    processedAt: moment.utc()
  }

  for (let answer of completedCheck.data.answers) {
    if (answer.factor1 * answer.factor2 === parseInt(answer.answer, 10)) {
      answer.isCorrect = true
      results.marks += 1
    } else {
      answer.isCorrect = false
    }
  }

  // update the check meta info
  await checkDataService.sqlUpdateCheckWithResults(completedCheck.data.pupil.checkCode, results.marks, results.maxMarks, results.processedAt)
}

module.exports = markingService
