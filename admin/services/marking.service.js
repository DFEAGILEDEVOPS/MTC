'use strict'

const moment = require('moment')
const winston = require('winston')
const R = require('ramda')

const completedCheckDataService = require('./data-access/completed-check.data.service')
const checkDataService = require('./data-access/check.data.service')
const answerDataService = require('./data-access/answer.data.service')
const monitor = require('../helpers/monitor')

const markingService = {}
const batchSize = 100

/**
 * A process that runs until all completedChecks have been marked
 * @return {Promise.<void>}
 */
markingService.process = async function () {
  try {
    let hasWorkToDo = await completedCheckDataService.sqlHasUnmarked()
    if (!hasWorkToDo) {
      winston.info('Processing: nothing to do')
    }
    while (hasWorkToDo) {
      await markingService.applyMarking(batchSize)
      hasWorkToDo = await completedCheckDataService.sqlHasUnmarked()
    }
  } catch (error) {
    console.error('Bailing out: ', error)
  }
}
/**
 * Apply marking for unmarked checks limited by batchSize
 * @param {Number} batchSize
 * @return {Boolean}
 */
markingService.applyMarking = async function (batchSize) {
  const batchIds = await completedCheckDataService.sqlFindUnmarked(batchSize)

  if (batchIds.length === 0) {
    winston.info('No IDs found')
    return false
  }

  await markingService.batchMark(batchIds)

  winston.info('Processed %d completed checks', batchIds.length)
  return true
}

markingService.batchMark = async function (batchIds) {
  if (!batchIds) {
    throw new Error('Missing arg batchIds')
  }
  if (!batchIds.length) {
    throw new Error('No documents to mark')
  }

  const completedChecksWithCheckForms = await completedCheckDataService.sqlFindByIdsWithForms(batchIds)
  for (let cc of completedChecksWithCheckForms) {
    try {
      await markingService.mark(cc)
    } catch (error) {
      winston.error('Error marking document: ', error)
      // We can ignore this error and re-try the document again.
      // ToDo: add a count to the document of the number of processing attempts?
    }
  }
}

// completedCheck also includes the checkForm
markingService.mark = async function (completedCheck) {
  if (!completedCheck || !completedCheck.data || !completedCheck.data.answers || !completedCheck.formData) {
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

  for (let question of completedCheck.formData) {
    const currentIndex = questionNumber - 1
    const answerRecord = completedCheck.data.answers[currentIndex]
    const answer = (answerRecord && answerRecord.answer) || ''
    const data = {
      questionNumber,
      factor1: question.f1,
      factor2: question.f2,
      answer: R.slice(0, 60, answer)
    }
    questionNumber += 1

    if (answer && question.f1 * question.f2 === parseInt(answer, 10)) {
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

module.exports = monitor('marking.service', markingService)
