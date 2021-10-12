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

/**
 * Sort and add Identification flags.
 * @deprecated - Use `pupilIdentificationFlagService.sortAndAddIdentificationFlags` directly.
 * @param pupils
 * @returns {import('services/pupil-identification-flag.service').IdentifiedPupil[]}
 */
pupilPresenter.getPupilsSortedWithIdentificationFlags = (pupils) => {
  return pupilIdentificationFlag.sortAndAddIdentificationFlags(pupils)
}

module.exports = pupilPresenter
