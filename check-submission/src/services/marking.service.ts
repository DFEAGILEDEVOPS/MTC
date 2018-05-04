'use strict'

const moment = require('moment')
const R = require('ramda')

const checkDataService = require('./data-access/check.data.service')
const answerDataService = require('./data-access/answer.data.service')

const markingService = {
  mark: async function (completedCheck) {
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
}

export = markingService
