'use strict'

const { isArray } = require('ramda-adjunct')
const { assoc, prop } = require('ramda')
const moment = require('moment')

const jsFormat = 'Y-MM-DDTHH:mm:ss.SSSZ'

const getQuestionTimerStartEvent = function (audits, questionNumber, factor1, factor2) {
  if (!isArray(audits)) {
    return
  }
  const audit = audits.find(e => {
    return (e.type === 'QuestionTimerStarted') &&
      e.data &&
      e.data.sequenceNumber === questionNumber &&
      e.data.question === `${factor1}x${factor2}`
  })
  if (!audit) { return }
  const clientTimestamp = prop('clientTimestamp', audit)
  if (clientTimestamp) {
    const ts = moment(clientTimestamp, jsFormat, true)
    if (ts.isValid()) {
      return assoc('momentTimestamp', ts, audit)
    }
  }
  return audit
}

module.exports = getQuestionTimerStartEvent
