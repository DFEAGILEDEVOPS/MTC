'use strict'

const R = require('ramda')

const accessArrangementsDescriptionsPresenter = {}

/**
 * Fetch access arrangements description data in an alphabetical order
 * @param {Array} accessArrangements
 * @returns {Array} attendanceCodesPresentationData
 */
accessArrangementsDescriptionsPresenter.getPresentationData = (accessArrangements) => {
  const diff = (a, b) => a.description.toLowerCase().localeCompare(b.description.toLowerCase())
  return R.sort(diff, accessArrangements)
}

module.exports = accessArrangementsDescriptionsPresenter
