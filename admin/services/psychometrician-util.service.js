'use strict'

const R = require('ramda')
const moment = require('moment')
const winston = require('winston')
const useragent = require('useragent')

const psUtilService = {}

psUtilService.getMark = function getMark (completedCheck) {
  return R.pathOr('error', ['mark'], completedCheck)
}

psUtilService.getClientTimestampFromAuditEvent = function (auditEventType, completedCheck) {
  const logEntries = completedCheck.data.audit.filter(logEntry => logEntry.type === auditEventType)
  if (!logEntries.length) {
    return 'error'
  }
  const logEntry = logEntries[0]
  if (!logEntry.hasOwnProperty('clientTimestamp')) {
    return 'error'
  }
  return logEntry.clientTimestamp
}

/**
 * Consolidate the touch start event with the click event that follows it
 * @param val
 * @param idx
 * @param ary
 */
psUtilService.cleanUpTouchEvents = function (obj, idx, ary) {
  if (obj.eventType === 'touchstart') {
    return null
  }
  if (obj.eventType !== 'click') {
    return obj
  }
  const precedingEvent = ary[idx - 1]

  if (precedingEvent && precedingEvent.eventType === 'touchstart') {
    // consolidate touchstart and click events into a single touch event for reporting
    const o = Object.assign({}, obj)
    o.eventType = 'touch'
    return o
  }

  return obj
}

/**
 * Return all key/mouse/touch inputs as a string for the report
 * @param {Object} answer
 * @return {string}
 */
psUtilService.getUserInput = function getUserInput (inputs) {
  const output = []
  if (!inputs) {
    return ''
  }
  if (!Array.isArray(inputs)) {
    return ''
  }
  inputs
    .filter(inp => inp.eventType !== 'mousedown')
    .map(this.cleanUpTouchEvents)
    .filter(inp => !!inp) // filter out nulls
    .forEach(inp => {
      let ident = ''

      switch (inp.eventType) {
        case 'keydown':
          // hardware keyboard was pressed
          ident = 'k'
          break
        case 'click':
        case 'mousedown':
          // Mouse was pressed
          ident = 'm'
          break
        case 'touch':
          // Mouse or fingers on a screen
          ident = 't'
          break
        default:
          winston.info('Unknown input type: ' + inp.eventType)
          winston.info('inp ', inp)
          ident = 'u'
          break
      }
      output.push(`${ident}[${inp.input}]`)
    })
  return output.join(', ')
}

/**
 * Get the time of the user's last input that is not enter
 * @param {Array} inputs
 * @return {String}
 */
psUtilService.getLastAnswerInputTime = function (inputs) {
  if (!(inputs && Array.isArray(inputs))) {
    winston.info('Invalid param inputs')
    return 'error'
  }
  if (inputs.length === 0) {
    return ''
  }
  for (let i = inputs.length - 1; i >= 0; i--) {
    const input = R.pathOr('', [i, 'input'], inputs)
    if (input.toUpperCase() !== 'ENTER') {
      return R.pathOr('error', [i, 'clientInputDate'], inputs)
    }
  }
}

/**
 * Returns the client timestamp as a string of the first input from the user
 * @param inputs
 * @return {String}
 */
psUtilService.getFirstInputTime = function (inputs) {
  if (!(inputs && Array.isArray(inputs))) {
    winston.info('Invalid param inputs')
    return 'error'
  }
  if (inputs.length === 0) {
    return ''
  }
  return R.pathOr('error', [0, 'clientInputDate'], inputs)
}

/**
 * Calculate the response time for the question: time between the first key being pressed and the last key being pressed
 * @param {Array} input
 * @return {*}
 */
psUtilService.getResponseTime = function (inputs) {
  if (!(inputs && Array.isArray(inputs))) {
    winston.info('Invalid param inputs')
    return 'error'
  }
  if (inputs.length === 0) {
    return ''
  }
  const first = moment(this.getFirstInputTime(inputs))
  const last = moment(this.getLastAnswerInputTime(inputs))
  if (!(first.isValid() && last.isValid())) {
    return ''
  }
  return (last.format('x') - first.format('x')) / 1000
}

/**
 * A flag to determine if the question timed out (rather than the user pressing Enter)
 * @param inputs
 * @return {string|number}
 */
psUtilService.getTimeoutFlag = function (inputs) {
  let timeout = 1
  if (!(inputs && Array.isArray(inputs))) {
    winston.info('invalid input: ', inputs)
    return 'error'
  }
  if (R.pathOr('', ['input'], R.last(inputs)).toUpperCase() === 'ENTER') {
    timeout = 0
  }
  return timeout
}

/**
 * Return a flag indicating if the question timed out, without any response
 * @param inputs
 * @param answer
 * @return {*}
 */
psUtilService.getTimeoutWithNoResponseFlag = function (inputs, answer) {
  if (!Array.isArray(inputs)) {
    return 'error'
  }
  const timeout = this.getTimeoutFlag(inputs)
  if (!timeout) {
    return ''
  }

  let timeoutNoResponse = 1
  const hasTimeout = psUtilService.getTimeoutFlag(inputs)
  if (hasTimeout === 1 && answer.answer === '') {
    timeoutNoResponse = 0
  }
  return timeoutNoResponse
}

/**
 * Return 1 if the question timed out, and the correct answer was given. 0 otherwise.
 * @param inputs - inputs from the SPA data
 * @param {answer} ans - marked answer from the `answer` table
 * @return {number||string}
 */
psUtilService.getTimeoutWithCorrectAnswer = function (inputs, markedAnswer) {
  const timeout = this.getTimeoutFlag(inputs)
  if (!timeout) {
    return ''
  }
  if (this.getTimeoutFlag(inputs) === 1 && markedAnswer.isCorrect) {
    return 1
  }
  return 0
}

psUtilService.getScore = function (markedAnswer) {
  if (!markedAnswer.hasOwnProperty('isCorrect')) {
    return 'error'
  }
  return markedAnswer.isCorrect ? 1 : 0
}

psUtilService.getDevice = function (userAgent) {
  if (!userAgent) {
    return ''
  }
  const agent = useragent.parse(userAgent)
  return agent.device.toString().replace('0.0.0', '').trim()
}

psUtilService.getBrowser = function (userAgent) {
  if (!userAgent) {
    return ''
  }
  const agent = useragent.parse(userAgent)
  return agent.toString()
}

psUtilService.getLoadTime = function (questionNumber, audits) {
  const entry = audits.find(e => {
    if (R.propEq('type', 'QuestionRendered', e) &&
      R.path(['data', 'sequenceNumber'], e) === questionNumber) {
      return true
    }
  })
  return R.propOr('', 'clientTimestamp', entry || {})
}

psUtilService.getOverallTime = function (tLastKey, tLoad) {
  if (!tLastKey || !tLoad) {
    return ''
  }
  const m1 = moment(tLastKey)
  if (!m1.isValid()) {
    return ''
  }
  const m2 = moment(tLoad)
  if (!m2.isValid()) {
    return ''
  }
  return m1.diff(m2) / 1000
}

/**
 * Return the recall time: the difference in seconds between the question appearing and the first key pressed
 * @param {string} tLoad - ISO8601 string e.g. "2018-02-16T20:06:30.700Z"
 * @param {string} tFirstKey - ISO8601 string - ditto
 */
psUtilService.getRecallTime = function (tLoad, tFirstKey) {
  if (!tLoad || !tFirstKey) {
    return ''
  }
  const m1 = moment(tLoad)
  if (!m1.isValid()) {
    return ''
  }
  const m2 = moment(tFirstKey)
  if (!m2.isValid()) {
    return ''
  }
  return m2.diff(m1) / 1000
}

psUtilService.getInputMethod = function (inputs) {
  if (!inputs) {
    return ''
  }
  if (!Array.isArray(inputs)) {
    return ''
  }
  const types = {
    key: 0,
    mouse: 0,
    touch: 0
  }
  inputs.forEach((input) => {
    const eventType = R.prop('eventType', input)
    switch (eventType) {
      case 'keydown':
        types['key'] += 1
        break
      case 'touch':
        types['touch'] += 1
        break
      case 'mousedown':
      case 'click':
        types['mouse'] += 1
        break
      default:
        if (eventType) {
          winston.info('UNKNOWN event type' + eventType)
        }
    }
  })

  if (types['key'] && !types['mouse'] && !types['touch']) {
    return 'k'
  } else if (types['mouse'] && !types['key'] && !types['touch']) {
    return 'm'
  } else if (types['touch'] && !types['key'] && !types['mouse']) {
    return 't'
  } else if (!types['key'] && !types['mouse'] && !types['touch']) {
    return ''
  } else {
    return 'x' // combination
  }
}

module.exports = psUtilService
