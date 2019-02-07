'use strict'
const moment = require('moment')

const hdfPresenter = {}

hdfPresenter.getResultsDate = (hdf) => {
  return moment(hdf.checkEndDate).add(1, 'weeks').isoWeekday('Monday').set({ hour: 8, minutes: 0, seconds: 0 }) // next monday after the check ends
}

hdfPresenter.getCanViewResults = (resultsDate) => {
  return moment().isAfter(resultsDate)
}

module.exports = hdfPresenter
