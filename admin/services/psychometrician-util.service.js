'use strict'

const R = require('ramda')
const moment = require('moment')
const winston = require('winston')

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
 * Returns the timerstamp as a string of the first input from the user
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
  let timeout = 0
  if (!(inputs && Array.isArray(inputs))) {
    return 'error'
  }
  if (inputs.length === 0 && answer.answer === '') {
    timeout = 1
  }
  return timeout
}

/**
 * Return 1 if the question timed out, and the correct answer was given. 0 otherwise.
 * @param inputs
 * @param ans
 * @return {number}
 */
psUtilService.getTimeoutWithCorrectAnswer = function (inputs, ans) {
  if (this.getTimeoutFlag(inputs) === 1 && ans.isCorrect) {
    return 1
  }
  return 0
}

module.exports = psUtilService
