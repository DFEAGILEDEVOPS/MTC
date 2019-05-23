'use strict'
const pupilIdentificationFlag = require('../services/pupil-identification-flag.service')
const dateService = require('../services/date.service')

const resultPresenter = {}

/**
 * Fetch pupil data for the results view
 * @returns {Array} pupil data
 */
resultPresenter.getResultsViewData = (pupils) => {
  let pupilData = []
  pupils.forEach((p) => {
    pupilData.push({
      foreName: p.foreName,
      lastName: p.lastName,
      middleNames: p.middleNames,
      dateOfBirth: p.dateOfBirth,
      score: p.reason ? '-' : p.mark,
      reason: p.reason,
      group_id: p.group_id
    })
  })
  return pupilIdentificationFlag.addIdentificationFlags(pupilData)
}

/**
 * Returns score with one decimal place
 * @param {Number} score
 * @returns {Number}
 */
resultPresenter.formatScore = (score) => score && (Math.round(score * 10) / 10)

/**
 * Get results opening date in full GDS format
 * @param {Object} resultsOpeningDate
 * @returns {String}
 */
resultPresenter.formatResultsOpeningDate = (resultsOpeningDate) => {
  return dateService.formatFullGdsDate(resultsOpeningDate)
}

module.exports = resultPresenter
