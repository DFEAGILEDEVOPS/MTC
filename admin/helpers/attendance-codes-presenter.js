'use strict'

const R = require('ramda')

const attendanceCodesPresenter = {}

/**
 * Fetch attendance codes data in an alphabetical order
 * @param {Array} attendanceCodes
 * @returns {Array} attendanceCodesPresentationData
 */
attendanceCodesPresenter.getPresentationData = (attendanceCodes) => {
  // The db actually has an order field, which is for the ui, but for some unknown reason,
  // we sort here, instead of changing the order field.
  const diff = (a, b) => a.reason.toLowerCase().localeCompare(b.reason.toLowerCase())
  return R.sort(diff, attendanceCodes)
}

module.exports = attendanceCodesPresenter
