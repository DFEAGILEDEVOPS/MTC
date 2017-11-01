'use strict'

const R = require('ramda')
const psUtilService = {}

psUtilService.getSurname = function (completedCheck) {
  return completedCheck.check.pupilId.lastName.substr(0, 35)
}

psUtilService.getForename = function (completedCheck) {
  return completedCheck.check.pupilId.foreName.substr(0, 35)
}

psUtilService.getMiddleNames = function (completedCheck) {
  return R.pathOr('', ['check', 'pupilId', 'middleNames'], completedCheck).substr(0, 35)
}

psUtilService.getMark = function getMark (completedCheck) {
  return R.pathOr('error', ['check', 'results', 'marks'], completedCheck)
}

psUtilService.getSchoolURN = function (completedCheck) {
  return R.pathOr('n/a', ['check', 'pupilId', 'school', 'urn'], completedCheck)
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
          console.log('Unknown input type: ' + inp.eventType)
          console.log('inp ', inp)
          ident = 'u'
          break
      }
      output.push(`${ident}[${inp.input}]`)
    })
  return output.join(', ')
}

module.exports = psUtilService
