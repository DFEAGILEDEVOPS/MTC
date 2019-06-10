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
    let statusInformation = ''
    // if (p.pupilStatusCode !== 'COMPLETED' && p.pupilStatusCode !== 'NOT_TAKING' && !p.checkStatusCode) {
    //   statusInformation = 'Did not participate'
    // }
    if (p.pupilStatusCode !== 'COMPLETED' && p.pupilStatusCode !== 'NOT_TAKING') {
      statusInformation = 'Did not participate'
    }
    const restartCheckStatusCodes = ['NTR', 'EXP', 'CMP']
    if (p.pupilStatusCode === 'UNALLOC' && restartCheckStatusCodes.includes(p.checkStatusCode)) {
      statusInformation = 'Did not attempt the restart'
    }
    if (p.checkStatusCode === 'NTR' && p.pupilStatusCode === 'STARTED') {
      statusInformation = 'Incomplete'
    }
    pupilData.push({
      foreName: p.foreName,
      lastName: p.lastName,
      middleNames: p.middleNames,
      dateOfBirth: p.dateOfBirth,
      score: p.reason || statusInformation.length > 0 ? '-' : p.mark,
      status: p.reason || statusInformation,
      group_id: p.group_id
    })
  })
  return {
    pupilData: pupilIdentificationFlag.addIdentificationFlags(pupilData),
    maxMark: pupils[0].maxMark
  }
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
