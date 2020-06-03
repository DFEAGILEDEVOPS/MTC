'use strict'
const moment = require('moment')

const dateService = require('../services/date.service')
const resultPresenter = {}

/**
 * Get results opening date in full GDS format
 * @param {Object} resultsOpeningDate
 * @returns {String}
 */
resultPresenter.formatResultsOpeningDate = (resultsOpeningDate) => {
  return dateService.formatFullGdsDate(resultsOpeningDate)
}

/**
 * Get results generated datetime in full GDS format
 * @param {String} generatedAt
 * @returns {String}
 */
resultPresenter.formatGeneratedAtValue = (generatedAt) => {
  return dateService.formatDateAndTime(moment(generatedAt))
}

module.exports = resultPresenter
