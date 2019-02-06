'use strict'
const moment = require('moment')

const hdfPresenter = {}

hdfPresenter.getResultsDate = (hdf) => {
  return moment(hdf.checkEndDate).add(1, 'weeks').isoWeekday('Monday') // next monday after the check ends
}

hdfPresenter.getCanViewResults = (resultsDate) => {
  return moment().isAfter(resultsDate)
}

module.exports = hdfPresenter
