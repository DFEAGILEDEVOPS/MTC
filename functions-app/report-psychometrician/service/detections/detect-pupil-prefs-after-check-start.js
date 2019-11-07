'use strict'

const { prop, propOr, assoc } = require('ramda')
const { isPlainObj, isNotNilOrEmpty } = require('ramda-adjunct')

const getCheckStartedDate = require('./get-check-started-date')
const dateService = require('../../../lib/date.service')
const report = require('./report')
const removeDuplicates = require('./remove-duplicate-anomaly-reports')

const detectPupilPrefsAfterCheckStart = function (data) {
  if (!isPlainObj(data)) {
    throw new TypeError('data should be an object')
  }

  const payload = prop('checkPayload', data)
  const audits = propOr([], 'audit', payload)

  const checkStartedDate = getCheckStartedDate(
    null, // always get the date from the audit log
    payload
  )

  const prefsAudits = audits.filter(o => o.type === 'PupilPrefsAPICallSucceeded')
  const prefsAuditsWithMomentTimestamps = prefsAudits.map(o => {
    const momentTs = dateService.convertIsoStringToMoment(o.clientTimestamp)
    if (momentTs) {
      return assoc('momentTimestamp', momentTs, o)
    }
    return o
  })
  const output = prefsAuditsWithMomentTimestamps.map(o => {
    if (o.momentTimestamp && o.momentTimestamp.isAfter(checkStartedDate)) {
      return report(data, 'Check disrupted by PupilPrefsAPICallSucceeded event')
    }
  })
  return removeDuplicates(output.filter(o => isNotNilOrEmpty(o)))
}

module.exports = detectPupilPrefsAfterCheckStart
