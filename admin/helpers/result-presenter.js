'use strict'
const moment = require('moment')
const R = require('ramda')

const dateService = require('../services/date.service')
const resultPresenter = {
  /**
   * Get results opening date in full GDS format
   * @param {Object} resultsOpeningDate
   * @returns {String}
   */
  formatResultsOpeningDate: function formatResultsOpeningDate (resultsOpeningDate) {
    return dateService.formatFullGdsDate(resultsOpeningDate)
  },

  /**
   * Get results generated datetime in full GDS format
   * @param {String} generatedAt
   * @returns {String}
   */
  formatGeneratedAtValue: function formatGeneratedAtValue (generatedAt) {
    return dateService.formatDateAndTime(moment(generatedAt))
  },

  presentPupilData: function presentPupilData (pupil) {
    const o = R.clone(pupil)
    const scoreSlot = R.propOr('-', 'score', pupil)
    console.log('presentation pupil', o)
    return R.assoc('score', scoreSlot, o)
  }
}

module.exports = resultPresenter
