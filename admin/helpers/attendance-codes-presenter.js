'use strict'

const R = require('ramda')

const attendanceCodesPresenter = {}

/**
 * Fetch attendance codes data in an alphabetical order
 * @param {Array} attendanceCodes
 * @returns {Array} attendanceCodesPresentationData
 */
attendanceCodesPresenter.getPresentationData = (attendanceCodes) => {
  const diff = (a, b) => a.reason.toLowerCase().localeCompare(b.reason.toLowerCase())
  return R.sort(diff, attendanceCodes)
}

module.exports = attendanceCodesPresenter
