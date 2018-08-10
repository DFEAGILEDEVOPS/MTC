'use strict'

const R = require('ramda')
const moment = require('moment')
const momentDurationFormatSetup = require('moment-duration-format')
const winston = require('winston')
const useragent = require('useragent')
const device = require('device')
const hash = require('object-hash')
const monitor = require('../helpers/monitor')

momentDurationFormatSetup(moment)

const psUtilService = {}

psUtilService.getMark = function getMark (completedCheck) {
  if (!completedCheck.data) return ''
  return R.pathOr('error', ['mark'], completedCheck)
}

psUtilService.getClientTimestampFromAuditEvent = function (auditEventType, completedCheck) {
  if (!completedCheck.data) return ''
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

psUtilService.getClientTimestampDiffFromAuditEvents = function (firstAuditEventType, secondAuditEventType, completedCheck) {
  if (!completedCheck.data) return ''

  return moment.duration(
    moment(psUtilService.getClientTimestampFromAuditEvent(secondAuditEventType, completedCheck))
      .diff(moment(psUtilService.getClientTimestampFromAuditEvent(firstAuditEventType, completedCheck)))
  ).format('HH:mm:ss', {trim: false})
}

/**
 * Consolidate the touch start event with the click event that follows it
 * @param [{object}] - the entire array of inputs for a single question
 * @return [{object}] - filtered and transformed objects
 */
psUtilService.cleanUpInputEvents = function (inputEvents) {
  // This algorithm works by buffering all touchstart and mousedown events and clicks until it sees a
  // new touchstart then it associates the last touchstart or mousedown event with the last click, and
  // works backwards until all the clicks have been handled. It will then parse the next batch of
  // touchstart and click events.
  //
  // Excess touchstart or mousedown events are ignored.

  const openTouchAndMouseEvents = []
  const clickEvents = []
  const output = []
  const touchCount = inputEvents.filter(event => R.propEq('eventType', 'touchstart', event)).length
  const mouseCount = inputEvents.filter(event => R.propEq('eventType', 'mousedown', event)).length

  for (let event of inputEvents) {
    if (event === null || event === undefined) {
      winston.info(`psUtilService.cleanUpInputEvents: empty event found`)
      continue
    }
    const eventType = R.prop('eventType', event)
    if (eventType === 'touchstart' || eventType === 'mousedown') {
      // check to see if what we have inputs in the click buffer and touch/mouse buffers
      clearBuffers(clickEvents, openTouchAndMouseEvents, output)
      openTouchAndMouseEvents.push(event)
      continue
    }

    if (eventType === 'click' && openTouchAndMouseEvents.length > 0) {
      clickEvents.push(event)
    } else if (eventType === 'click') {
      // A single click without any context.  Possibly the header is lost.
      if (touchCount > mouseCount) {
        // We take an educated guess as to what kind of click it is
        const newEvent = R.clone(event)
        newEvent.eventType = 'touch' // It's more likely to be a touch event
        output.push(newEvent)
      } else {
        // It will be treated, rightly or wrongly, as a mouse click
        output.push(R.clone(event))
      }
    } else if (eventType === 'keydown') {
      clearBuffers(clickEvents, openTouchAndMouseEvents, output)
      output.push(event)
    }
  }

  // Check for items left in the buffers
  clearBuffers(clickEvents, openTouchAndMouseEvents, output)
  return output
}

/**
 * Function used in `cleanUpInputEvents()` add the clientTimestamp to the click event
 * @param touchOrMouseEvent
 * @param clickEvent
 * @return {{input, eventType: string, clientTimestamp: *, question}}
 */
function mergeEvents (touchOrMouseEvent, clickEvent) {
  let eventType = clickEvent.eventType
  if (touchOrMouseEvent) {
    if (touchOrMouseEvent.eventType === 'touchstart') {
      eventType = 'touch'
    } else {
      eventType = 'click'
    }
  }

  const clientTimestamp = touchOrMouseEvent ? touchOrMouseEvent.clientTimestamp : clickEvent.clientTimestamp
  const newEvent = {
    input: clickEvent.input,
    eventType,
    clientTimestamp,
    question: clickEvent.question
  }
  return newEvent
}

/**
 * IMPURE function used in `cleanUpInputEvents()` - combine the buffers into events and add the event to the output object
 * @param clickEvents
 * @param openTouchAndMouseEvents
 * @param output
 */
function clearBuffers (clickEvents, openTouchAndMouseEvents, output) {
  const buffer = []
  while (clickEvents.length) {
    const clickEvent = clickEvents.pop()
    const touchOrMouseEvent = openTouchAndMouseEvents.pop()
    const newEvent = mergeEvents(touchOrMouseEvent, clickEvent)
    buffer.push(newEvent)
  }
  Array.prototype.push.apply(output, buffer.reverse())
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
  const normalisedInputs = psUtilService.cleanUpInputEvents(inputs)
  normalisedInputs.forEach(inp => {
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
 * @param {Object} answer
 * @return {String}
 */
psUtilService.getLastAnswerInputTime = function (inputs, answer) {
  if (!(inputs && Array.isArray(inputs))) {
    winston.info('Invalid param inputs')
    return 'error'
  }
  if (inputs.length === 0) {
    return ''
  }

  // We may have inputs, but no answer recorded.  E.g. 1,1,Backspace,Backspace
  // In which case there was no response
  if (!answer) {
    return ''
  }

  // Filter the inputs to only those that constitute the answer.  E.g. 0-9, Backspace
  const filtered = psUtilService.filterInputsToAnswerKeys(inputs)

  if (!filtered.length) {
    return ''
  }

  return R.pathOr('error', ['clientTimestamp'], R.last(filtered))
}

/**
 * Returns the client timestamp as a string of the first input from the user
 * @param {Array} inputs
 * @param {Object} answer
 * @return {String}
 */
psUtilService.getFirstInputTime = function (inputs, answer) {
  if (!(inputs && Array.isArray(inputs))) {
    winston.info('Invalid param inputs')
    return 'error'
  }
  if (inputs.length === 0) {
    return ''
  }

  // We may have inputs, but no answer recorded.  E.g. 1,1,Backspace,Backspace
  // In which case there was no response
  if (!answer) {
    return ''
  }

  // Filter the inputs to only those that constitute the answer.  E.g. 0-9, Backspace
  const filtered = psUtilService.filterInputsToAnswerKeys(inputs)

  if (!filtered.length) {
    return ''
  }

  return R.pathOr('error', ['clientTimestamp'], R.head(filtered))
}

psUtilService.filterInputsToAnswerKeys = function (inputs) {
  const normalisedInputs = psUtilService.cleanUpInputEvents(inputs)
  let answer = ''
  const output = []
  for (let event of normalisedInputs) {
    if (event.input.match(/^[0-9]$/)) {
      answer += event.input
      output.push(event)
      continue
    }
    if (event.input.toUpperCase() === 'BACKSPACE' && answer.length) {
      answer = answer.slice(0, -1) // remove last char
      output.push(event)
    }
    // All other inputs are ignored as they do not change the answer
    // NB this currently counts inputs that are longer than 5 chars
  }
  return output
}

/**
 * Calculate the response time for the question: time between the first key being pressed and the last key being pressed
 * @param {Array} input
 * @return {*}
 */
psUtilService.getResponseTime = function (inputs, answer) {
  if (!(inputs && Array.isArray(inputs))) {
    winston.info('Invalid param inputs')
    return 'error'
  }
  if (inputs.length === 0) {
    return ''
  }
  const first = moment(psUtilService.getFirstInputTime(inputs, answer))
  const last = moment(psUtilService.getLastAnswerInputTime(inputs, answer))

  if (!(first.isValid() && last.isValid())) {
    return ''
  }
  return (last.format('x') - first.format('x')) / 1000
}

/**
 * A flag to determine if the question timed out (rather than the user pressing Enter)
 * @param {String} answer - the answer provided
 * @param {[Object]} inputs
 * @return {string|number}
 */
psUtilService.getTimeoutFlag = function (answer, inputs) {
  let timeout = 1
  if (!(inputs && Array.isArray(inputs))) {
    winston.info('invalid input: ', inputs)
    return 'error'
  }

  const normalisedInputs = psUtilService.cleanUpInputEvents(inputs)

  // There can only be a timeout if there is an answer
  const isEnterKey = R.compose(
    R.propEq('input', 'ENTER'),
    R.evolve({ input: R.toUpper })
  )

  if (R.length(answer) > 0 && isEnterKey(R.last(normalisedInputs))) {
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
  const hasTimeout = psUtilService.getTimeoutFlag(answer.answer, inputs)
  if (!hasTimeout) {
    return ''
  }

  let timeoutNoResponse = 1
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
  const timeout = psUtilService.getTimeoutFlag(markedAnswer.answer, inputs)
  if (!timeout) {
    return ''
  }
  if (timeout === 1 && markedAnswer.isCorrect) {
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

/**
 * Parses the useragent and returns a type and model for  devices,
 * with model being 'Other' for desktop devices
 * `device` is a wrapper over `useragent` which simplifies type/model parsing
 *
 * @param userAgent
 * @return {object}
 */
psUtilService.getDeviceTypeAndModel = function (userAgent) {
  if (!userAgent) {
    return { type: '', model: '' }
  }
  const { type, model } = device(userAgent, { parseUserAgent: true })
  return { type, model }
}

/**
 * Generates a unique identifier for a device from its characteristics that don't change
 *
 * @param deviceOptions
 * @return {string}
 */
psUtilService.getDeviceId = function (deviceOptions) {
  if (!deviceOptions) return ''
  const uniqueOptions = R.pick(['cpu', 'navigator'], deviceOptions)
  if (R.isEmpty(uniqueOptions)) return ''

  return hash(uniqueOptions)
}

psUtilService.getBrowser = function (userAgent) {
  if (!userAgent) {
    return ''
  }
  const agent = useragent.lookup(userAgent)
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
  const normalisedInputs = psUtilService.cleanUpInputEvents(inputs)
  normalisedInputs.forEach(input => {
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

module.exports = monitor('psychometrician-util.service', psUtilService)
