'use strict'

const RA = require('ramda-adjunct')
const R = require('ramda')

const getCheckStartedDate = require('./get-check-started-date')
const getCheckCompleteDate = require('./get-check-complete-date')
const report = require('./report')

const checkTookTooLong = function (data) {
  if (!RA.isPlainObj(data)) {
    throw new TypeError('data should be an object')
  }

  const markedAnswers = R.pathOr([], ['markedAnswers', 'answer'], data) // contains the question info
  const config = R.pathOr({}, ['checkPayload', 'config'], data)
  const numberOfQuestions = R.length(markedAnswers) || 0

  // Calculate the max total time allowed for the check
  const maxCheckSeconds = (numberOfQuestions * config.loadingTime) +
    (numberOfQuestions * config.questionTime) +
    (config.questionReader ? numberOfQuestions * 2.5 : 0)

  const checkStartedDate = getCheckStartedDate(
    R.prop('checkStartedAt', data),
    R.prop('checkPayload', data)
  )
  const checkCompleteDate = getCheckCompleteDate(R.prop('checkPayload', data))

  if (!checkStartedDate || !checkCompleteDate) {
    return
  }

  const totalCheckSeconds = checkCompleteDate.diff(checkStartedDate, 'seconds')

  if (totalCheckSeconds > maxCheckSeconds) {
    return report(data, 'Check took too long', totalCheckSeconds, maxCheckSeconds)
  }
}

module.exports = checkTookTooLong
