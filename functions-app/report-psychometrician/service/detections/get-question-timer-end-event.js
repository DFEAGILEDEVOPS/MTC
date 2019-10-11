'use strict'

const { isArray } = require('ramda-adjunct')

const getQuestionTimerEndEvent = function (audits, questionNumber, factor1, factor2) {
  if (!isArray(audits)) {
    return
  }
  return audits.find(e => {
    return (e.type === 'QuestionTimerCancelled' || e.type === 'QuestionTimerEnded') &&
      e.data &&
      e.data.sequenceNumber === questionNumber &&
      e.data.question === `${factor1}x${factor2}`
  })
}

module.exports = getQuestionTimerEndEvent
