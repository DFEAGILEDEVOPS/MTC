'use strict'

const moment = require('moment')
const R = require('ramda')

function getCheckCompleteDate (payload) {
  if (typeof payload !== 'object') return
  const audits = R.prop('audit', payload)
  if (!audits) return
  const checkCompleteEvent = R.find(R.propEq('type', 'CheckSubmissionPending'), audits)
  if (!checkCompleteEvent) return
  const ts = R.prop('clientTimestamp', checkCompleteEvent)
  if (!ts) return
  return moment(ts)
}

module.exports = getCheckCompleteDate
