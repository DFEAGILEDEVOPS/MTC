'use strict'

const R = require('ramda')
const report = require('./report')

/**
 * Detect wrong number of answers
 * @param {object} data
 * @return {object}
 */
const detectWrongNumberOfAnswers = function detectWrongNumberOfAnswers (data) {
  const numberOfQuestions = R.length(R.path(['checkPayload', 'questions'], data))
  const numberOfAnswers = R.length(R.path(['checkPayload', 'answers'], data))

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
