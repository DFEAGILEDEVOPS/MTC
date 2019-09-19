'use strict'

const useragent = require('useragent')
const R = require('ramda')

const dateService = require('../date.service')
const getCheckStartedDate = require('./get-check-started-date')

const report = function report (data,
  message,
  testedValue = null,
  expectedValue = null,
  questionNumber = null) {
  const checkCode = R.prop('checkCode', data)
  const checkStartDate = getCheckStartedDate(R.prop('checkStartedAt', data), R.prop('checkPayload', data))
  const mark = R.prop('mark', data)
  const maxMark = R.prop('maxMark', data)
  const userAgentString = R.pathOr('', ['checkPayload', 'device', 'navigator', 'userAgent'], data)
  const agent = useragent.lookup(userAgentString)

  return {
    'Attempt ID': checkCode,
    Date: dateService.formatUKDate(checkStartDate),
    Mark: `${mark} out of ${maxMark}`,
    Device: agent.device.toString().replace('0.0.0', ''),
    Agent: agent.toString(),
    Message: message,
    'Tested Value': testedValue,
    'Expected Value': expectedValue,
    'Question number': questionNumber
  }
}

module.exports = report
