'use strict'

const moment = require('moment')

const getDuration = function (m1, m2) {
  if (!moment.isMoment(m1)) {
    return ''
  }

  if (!moment.isMoment(m2)) {
    return ''
  }

  const ms = m1.diff(m2)
  if (Number.isNaN(ms)) {
    return ''
  }

  const seconds = (ms / 1000).toFixed(1)
  return seconds
}

module.exports = getDuration
