'use strict'

const moment = require('moment')
const winston = require('winston')
const R = require('ramda')

const completedCheckDataService = require('./data-access/completed-check.data.service')
const checkDataService = require('./data-access/check.data.service')
const answerDataService = require('./data-access/answer.data.service')
const checkFormDataService = require('./data-access/check-form.data.service')

const markingService = {}

markingService.batchMark = async function (batchIds) {
  if (!batchIds) {
    throw new Error('Missing arg batchIds')
  }
  if (!batchIds.length) {
    throw new Error('No documents to mark')
  }

  const completedChecks = await completedCheckDataService.sqlFindByIds(batchIds)
  const checkFormIds = completedChecks.map(c => c.checkForm_id)
  const checkForms = await checkFormDataService.sqlFindByIds(checkFormIds)
  const checkFormsHashMap = checkForms.reduce((obj, item) => {
    obj[ item.id ] = item
    return obj
  }, {})
  for (let cc of completedChecks) {
    try {
      const checkForm = checkFormsHashMap[cc.checkForm_id]
      await this.mark(cc, checkForm)
    } catch (error) {
      winston.error('Error marking document: ', error)
      // We can ignore this error and re-try the document again.
      // ToDo: add a count to the document of the number of processing attempts?
    }
  }
}

markingService.mark = async function (completedCheck, checkForm) {
  if (!completedCheck || !completedCheck.data || !completedCheck.data.answers || !checkForm || !checkForm.formData) {
    throw new Error('missing or invalid argument')
  }

  const results = {
    marks: 0,
    maxMarks: completedCheck.data.answers.length,
    // TODO date service?
    processedAt: moment.utc()
  }

  const formData = JSON.parse(checkForm.formData)

  // Store the mark for each answer
  const answers = []
  let questionNumber = 1

  for (let question of formData) {
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

module.exports = markingService
