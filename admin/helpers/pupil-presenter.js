'use strict'

const pupilIdentificationFlag = require('../services/pupil-identification-flag.service')

const pupilPresenter = {}

/**
 * Fetch example pupil year for add pupil view
 * @returns {Number} Formatted example pupil year
 */
pupilPresenter.getPupilExampleYear = () => {
  const deductionYears = 8
  const currentYear = (new Date()).getFullYear() // returns number
  return currentYear - deductionYears
}

pupilPresenter.getPupilsSortedWithIdentificationFlags = (pupils) => {
  pupils.sort((a, b) => {
    return (a.lastName === b.lastName ? 0 : a.lastName.localeCompare(b.lastName)) || (a.foreName === b.foreName ? 0 : a.foreName.localeCompare(b.foreName))
  })
  return pupilIdentificationFlag.addIdentificationFlags(pupils)
}

module.exports = pupilPresenter
