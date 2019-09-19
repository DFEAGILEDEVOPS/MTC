'use strict'

const R = require('ramda')
const moment = require('moment')
const report = require('./report')
const removeDuplicates = require('./remove-duplicate-anomaly-reports')

function filterInputsForQuestion (questionNumber, factor1, factor2, inputs) {
  const filteredInputs = R.filter(
    i => i.sequenceNumber === questionNumber &&
      i.question === `${factor1}x${factor2}`,
    inputs)
  return filteredInputs
}

const detectInputBeforeTheQuestionIsShown = function detectInputBeforeTheQuestionIsShown (data) {
  const anomalyReports = []
  const addToOutput = (...args) => anomalyReports.push(report(...args))
  // For each question we need to check that the inputs were not
  // received before the question was shown

  const markedAnswers = R.pathOr([], ['markedAnswers', 'answer'], data) // contains the question info
  const audits = R.pathOr([], ['checkPayload', 'audit'], data)

  markedAnswers.forEach(markedAnswer => {
    const questionTimerStartedAudit = audits.find(e => e.type === 'QuestionTimerStarted' && e.data && e.data.sequenceNumber === markedAnswer.questionNumber)
    if (!questionTimerStartedAudit) {
      addToOutput(data, 'QuestionTimerStarted not found', null, null, `Q${markedAnswer.questionNumber}`)
    }

    const questionShownAt = moment(questionTimerStartedAudit.clientTimestamp)
    if (!questionShownAt.isValid()) {
      addToOutput(data, 'QuestionTimerStarted Timestamp is not valid', questionTimerStartedAudit.clientTimestamp, 'Valid ts')
      return
    }
    // If there are any inputs before `questionTimerStarted` it's an anomaly
    const inputs = filterInputsForQuestion(markedAnswer.questionNumber, markedAnswer.factor1, markedAnswer.factor2, R.pathOr([], ['checkPayload', 'inputs'], data))
    if (!inputs) {
      // It's okay for there to be no inputs for a question - the pupil did not respond
      return
    }
    // Check the inputs to make sure they all the right question property
    inputs.forEach(input => {
      const inputTimeStamp = moment(input.clientTimestamp)
      if (!inputTimeStamp.isValid()) {
        return
      }
      if (inputTimeStamp.isBefore(questionShownAt)) {
        addToOutput(data, 'Input received before Question shown',
          input.clientTimestamp,
          `>= ${questionTimerStartedAudit.clientTimestamp}`,
          `Q${markedAnswer.questionNumber}`)
      }
    })
  })

  return removeDuplicates(anomalyReports)
}

module.exports = detectInputBeforeTheQuestionIsShown
