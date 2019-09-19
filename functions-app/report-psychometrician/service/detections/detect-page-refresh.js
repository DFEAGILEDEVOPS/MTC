'use strict'

const R = require('ramda')
const report = require('./report')

/**
 * Detect a page refresh
 * @param data
 */
const detectPageRefresh = function detectPageRefresh (data) {
  let pageRefreshCount = 0
  const audits = R.pathOr([], ['checkPayload', 'audit'], data)
  audits.forEach(entry => {
    if (entry.type === 'RefreshDetected') {
      pageRefreshCount += 1
    }
  })
  if (pageRefreshCount) {
    return report(data, 'Page refresh detected', pageRefreshCount, 0)
  }
}

module.exports = detectPageRefresh
