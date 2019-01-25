const moment = require('moment')
const R = require('ramda')

const sqlHelper = require('../lib/sql-helper')

const markingService = {}

/**
 * Apply marking and populate asnwers table for the completedCheck
 * Used in processing the psychometric report
 * @param {Object} completedCheckMessage
 * @param {Object} check
 * @return {Promise<*>}
 */
markingService.mark = async function (completedCheckMessage, check) {
  if (!completedCheckMessage || !completedCheckMessage.data || !completedCheckMessage.data.answers || !completedCheckMessage.formData) {
    throw new Error('missing or invalid argument: completed check message')
  }

  if (!check || !check.id) {
    throw new Error('missing or invalid argument: check data')
  }

  const results = {
    marks: 0,
    maxMarks: completedCheckMessage.data.answers.length,
    processedAt: moment.utc()
  }

  // Store the mark for each answer
  const answers = []
  let questionNumber = 1

  for (let question of completedCheckMessage.formData) {
    const currentIndex = questionNumber - 1
    const answerRecord = completedCheckMessage.data.answers[currentIndex]
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
  await sqlHelper.sqlUpdateCheckWithResults(
    completedCheckMessage.checkCode,
    results.marks,
    results.maxMarks,
    results.processedAt
  )

  // Update the answers table
  await sqlHelper.sqlUpdateAnswersWithResults(check.id, answers)
}

module.exports = markingService
