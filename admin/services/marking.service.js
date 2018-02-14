'use strict'

const moment = require('moment')
const winston = require('winston')
const R = require('ramda')

const completedCheckDataService = require('./data-access/completed-check.data.service')
const checkDataService = require('./data-access/check.data.service')
const answerDataService = require('./data-access/answer.data.service')

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

  // Store the mark for each answer
  const answers = []
  let questionNumber = 1

  for (let answer of completedCheck.data.answers) {
    const data = R.clone(answer)
    data.answer = R.slice(0, 60, answer.answer)
    data.questionNumber = questionNumber
    questionNumber += 1

    if (answer.factor1 * answer.factor2 === parseInt(answer.answer, 10)) {
      data.isCorrect = true
      results.marks += 1
    } else {
      data.isCorrect = false
    }

    answers.push(data)
  }

  // update the check meta info
  await checkDataService.sqlUpdateCheckWithResults(
    completedCheck.checkCode,
    results.marks,
    results.maxMarks,
    results.processedAt
  )

  // Update the answers table
  await answerDataService.sqlUpdateWithResults(completedCheck.id, answers)
}

module.exports = markingService
