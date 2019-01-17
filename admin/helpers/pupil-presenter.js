'use strict'
const moment = require('moment')

const pupilPresenter = {}

/**
 * Fetch example pupil year for add pupil view
 * @returns {Number} Formatted example pupil year
 */
pupilPresenter.getPupilExampleYear = () => {
  const deductionYears = 8
  return moment.utc().format('YYYY') - deductionYears
}

module.exports = pupilPresenter
