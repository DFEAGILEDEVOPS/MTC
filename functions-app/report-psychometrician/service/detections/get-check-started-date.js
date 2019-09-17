'use strict'

const moment = require('moment')
const R = require('ramda')

function getCheckStartedDateFromAuditLog (payload) {
  if (typeof payload !== 'object') return undefined
  const audits = R.prop('audit', payload)
  if (!audits) return undefined
  const checkStartedEvent = R.find(R.propEq('type', 'CheckStarted'), audits)
  if (!checkStartedEvent) return undefined
  const ts = R.prop('clientTimestamp', checkStartedEvent)
  if (!ts) return undefined
  return moment(ts)
}

function getCheckStartedDate (checkStartedDate, payload) {
  if (moment.isMoment(checkStartedDate)) {
    return checkStartedDate
  }
  return getCheckStartedDateFromAuditLog(payload)
}

module.exports = getCheckStartedDate
