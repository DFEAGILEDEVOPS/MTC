'use strict'

const RA = require('ramda-adjunct')
const R = require('ramda')
const moment = require('moment')

const report = require('./report')
const filterInputsForQuestion = require('./filter-inputs-for-question')
const removeDuplicates = require('./remove-duplicate-anomaly-reports')
const getQuestionTimerEndEvent = require('./get-question-timer-end-event')
const dateFormat = 'YYYY-MM-DDThh:mm:ss.SSSZ'

const detectInputAfterTimerHasCompleted = function (data) {
  const anomalyReports = []
  const addToOutput = (...args) => anomalyReports.push(report(...args))

  if (!RA.isPlainObj(data)) {
    return
  }

  // For each question we need to check that the inputs were not
  // received after the questionTimer completed
  const markedAnswers = R.pathOr([], ['markedAnswers', 'answer'], data) // contains the question info
  const audits = R.pathOr([], ['checkPayload', 'audit'], data)

  markedAnswers.forEach(markedAnswer => {
    const questionTimerEndEvent = getQuestionTimerEndEvent(
      audits,
      markedAnswer.questionNumber,
      markedAnswer.factor1,
      markedAnswer.factor2
    )
    if (!questionTimerEndEvent) {
      addToOutput(data, 'QuestionTimerCancelled event not found for question', null, null, markedAnswer.questionNumber)
      return
    }
    const tsString = R.prop('clientTimestamp', questionTimerEndEvent)
    if (!tsString) {
      addToOutput(data, 'QuestionTimerCancelledEvent missing its timestamp', null, null, markedAnswer.questionNumber)
      return
    }
    let questionTimerEndedAt
    try {
      questionTimerEndedAt = moment(tsString, dateFormat, true)
      if (!questionTimerEndedAt.isValid()) {
        addToOutput(data, 'QuestionTimerCancelledEvent timestamp is not valid #1', questionTimerEndedAt.clientTimestamp, 'Valid ts', markedAnswer.questionNumber)
        return
      }
    } catch (ignore) {
      addToOutput(data, 'QuestionTimerCancelledEvent timestamp is not valid #2', questionTimerEndedAt.clientTimestamp, 'Valid ts', markedAnswer.questionNumber)
    }

    // If there are any inputs after `questionTimerCancelled` for this question it's an anomaly
    const inputs = filterInputsForQuestion(markedAnswer.questionNumber, markedAnswer.factor1, markedAnswer.factor2, R.pathOr([], ['checkPayload', 'inputs'], data))
    if (R.isEmpty(inputs)) {
      // It's okay for there to be no inputs for a question - the pupil did not respond
      return
    }

    // Check we don't have any inputs later than the question timer
    inputs.forEach(input => {
      const ts = R.prop('clientTimestamp', input)
      if (!ts) {
        addToOutput(data, 'input timestamp is missing', input.clientTimestamp, 'Valid ts', markedAnswer.questionNumber)
        return
      }
      let inputTimestamp
      try {
        inputTimestamp = moment(input.clientTimestamp, dateFormat, true)
        if (!inputTimestamp.isValid()) {
          addToOutput(data, 'input timestamp is not valid #1', input.clientTimestamp, 'Valid ts', markedAnswer.questionNumber)
          return
        }
      } catch (ignore) {
        addToOutput(data, 'input timestamp is not valid #2', input.clientTimestamp, 'Valid ts', markedAnswer.questionNumber)
        return
      }

      if (inputTimestamp.isAfter(questionTimerEndedAt)) {
        addToOutput(data, 'Input received before Question shown',
          input.clientTimestamp,
          tsString,
          markedAnswer.questionNumber)
      }
    })
  })
  return removeDuplicates(anomalyReports)
}

module.exports = detectInputAfterTimerHasCompleted
