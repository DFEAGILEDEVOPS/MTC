'use strict'
const moment = require('moment')

const hdfPresenter = {}

hdfPresenter.getResultsDate = (hdf) => {
  return hdf.checkEndDate.add(1, 'weeks').isoWeekday('Monday').set({ hour: 6, minutes: 0, seconds: 0 }) // next monday after the check ends
}

hdfPresenter.getCanViewResults = (resultsDate) => {
  return moment().utc().isAfter(resultsDate)
}

/**
 * Provides the hdf view with one of the following allowed statuses: Incomplete, NTTC and Complete
 * @param {Array} pupils
 * @returns {Promise<Array>}
 */
hdfPresenter.getPupilsWithViewStatus = (pupils) => {
  return pupils.map(p => {
    switch (p.pupilStatusCode) {
      case 'STARTED':
        p.status = 'Check started'
        if (p.checkStatusCode === 'NTR') {
          p.status = 'Incomplete'
        }
        break
      case 'NOT_TAKING':
        p.status = 'Not taking the Check'
        break
      case 'COMPLETED':
        p.status = 'Complete'
        break
      default:
        p.status = ''
    }
    return p
  })
}

module.exports = hdfPresenter
