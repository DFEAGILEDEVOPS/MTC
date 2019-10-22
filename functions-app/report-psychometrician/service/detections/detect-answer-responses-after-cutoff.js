'use strict'

const R = require('ramda')
const RA = require('ramda-adjunct')
const moment = require('moment')
const jsFormat = 'Y-MM-DDTHH:mm:ss.SSSZ'

const report = require('./report')
const getQuestionTimerStartEvent = require('./get-question-timer-start-event')
const getAnswer = require('./get-answer')
const { getDuration } = require('../../../lib/date.service')

const detectAnswerResponsesAfterCutoff = function (data) {
  if (!RA.isPlainObj(data)) {
    throw new TypeError('data should be an object')
  }
  const markedAnswers = R.pathOr([], ['markedAnswers', 'answer'], data)
  if (!RA.isArray(markedAnswers)) { return }
  if (R.length(markedAnswers) === 0) { return }
  const answers = R.path(['checkPayload', 'answers'], data)
  const audits = R.pathOr([], ['checkPayload', 'audit'], data)

  const output = markedAnswers.map(ma => {
    const questionTimerStartedEvent = getQuestionTimerStartEvent(audits, ma.questionNumber, ma.factor1, ma.factor2)
    const questionTimerTimestamp = R.prop('momentTimestamp', questionTimerStartedEvent)
    if (!moment.isMoment(questionTimerTimestamp)) { return }
    const cutoff = moment(questionTimerTimestamp).add(6.1, 'seconds')
    const answer = getAnswer(answers, ma.questionNumber)
    if (!answer || !moment.isMoment(answer.momentTimestamp)) { return }
    if (answer.momentTimestamp.isAfter(cutoff)) {
      return report(data,
        'Answer after cutoff',
        answer.clientTimestamp,
        cutoff.format(jsFormat),
        ma.questionNumber,
        getDuration(answer.momentTimestamp, cutoff)
      )
    }
  })
  return output.filter(o => RA.isNotNil(o))
}

module.exports = detectAnswerResponsesAfterCutoff
