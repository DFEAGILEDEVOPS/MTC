'use strict'

const useragent = require('useragent')
const R = require('ramda')

const dateService = require('../date.service')
const getCheckStartedDate = require('./get-check-started-date')

const report = function report (data,
  message,
  testedValue = null,
  expectedValue = null,
  questionNumber = null,
  tsDiff = null) {
  const checkCode = R.prop('checkCode', data)
  const checkStartDate = getCheckStartedDate(R.prop('checkStartedAt', data), R.prop('checkPayload', data))
  const mark = R.prop('mark', data)
  const maxMark = R.prop('maxMark', data)
  const userAgentString = R.pathOr('', ['checkPayload', 'device', 'navigator', 'userAgent'], data)
  const agent = useragent.lookup(userAgentString)

  return {
    'Attempt ID': checkCode,
    Date: dateService.formatUKDate(checkStartDate),
    QuestionReader: R.path(['checkPayload', 'config', 'questionReader'], data) ? 1 : 0,
    NextBetweenQuestions: R.path(['checkPayload', 'config', 'nextBetweenQuestions'], data) ? 1 : 0,
    InputAssistance: R.path(['checkPayload', 'config', 'inputAssistance'], data) ? 1 : 0,
    Mark: `${mark} out of ${maxMark}`,
    Device: agent.device.toString().replace('0.0.0', ''),
    Agent: agent.toString(),
    Message: message,
    'Tested Value': testedValue,
    'Expected Value': expectedValue,
    'TimestampDifference': tsDiff,
    'Question number': questionNumber
  }
}

module.exports = report
