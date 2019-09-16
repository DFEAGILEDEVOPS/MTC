'use strict'

const R = require('ramda')
const RA = require('ramda-adjunct');

const report = require('./report')

/**
 * Detect wrong number of answers
 * @param {object} data
 * @return {object}
 */
const detectWrongNumberOfAnswers = function detectWrongNumberOfAnswers (data) {
  const questions = R.path(['checkPayload', 'questions'], data)
  const answers = R.path(['checkPayload', 'answers'], data)

  if (!RA.isArray(questions)) {
    console.log(`Missing questions from ${data.checkCode}`)
    return
  }

  if (!RA.isArray(questions)) {
    console.log(`Missing answers from ${data.checkCode}`)
    return
  }

  const numberOfQuestions = R.length(questions)
  const numberOfAnswers = R.length(answers)

  if (numberOfQuestions !== numberOfAnswers) {
    return report(
      data,
      'Wrong number of answers',
      numberOfAnswers,
      numberOfQuestions
    )
  }
}

module.exports = detectWrongNumberOfAnswers
