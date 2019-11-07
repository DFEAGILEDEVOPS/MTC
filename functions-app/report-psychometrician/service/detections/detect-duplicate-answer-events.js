'use strict'
const { isPlainObj } = require('ramda-adjunct')
const { prop, propOr } = require('ramda')

const report = require('./report')

const detectDuplicateAnswerEvents = function detectDuplicateAnswerEvents (data) {
  if (!isPlainObj(data)) {
    throw new TypeError('data should be an object')
  }

  const payload = prop('checkPayload', data)
  const audits = propOr([], 'audit', payload)

  const events = audits.filter(o => o.type === 'DuplicateAnswerError')

  if (events.length > 0) {
    return report(data,
      'Duplicate answer event (' + events.length + ')',
      0,
      events.length,
      events.map(o => o.data.sequenceNumber).join(', '))
  }
}

module.exports = detectDuplicateAnswerEvents
