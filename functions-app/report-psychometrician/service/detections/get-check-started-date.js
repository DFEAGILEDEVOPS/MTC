'use strict'

const moment = require('moment')
const R = require('ramda')

function getCheckStartedDateFromAuditLog (payload) {
  if (typeof payload !== 'object') return
  const audits = R.prop('audit', payload)
  if (!audits) return
  const checkStartedEvent = R.find(R.propEq('type', 'CheckStarted'), audits)
  if (!checkStartedEvent) return
  const ts = R.prop('clientTimestamp', checkStartedEvent)
  if (!ts) return
  return moment(ts)
}

function getCheckStartedDate (checkStartedDate, payload) {
  if (moment.isMoment(checkStartedDate)) {
    return checkStartedDate
  }
  return getCheckStartedDateFromAuditLog(payload)
}

module.exports = getCheckStartedDate
