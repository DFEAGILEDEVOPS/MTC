'use strict'

const moment = require('moment')
const R = require('ramda')

const detections = {
  detectWrongNumberOfAnswers: require('./detections/detect-wrong-number-of-answers')
}

const rowToDataTransformations = {
  checkPayload: JSON.parse,
  markedAnswers: JSON.parse,
  checkCreatedAt: moment,
  checkStartedAt: moment
}

const isNotNil = R.complement(R.isNil)

/**
 *
 * @type {{detectAnomalies: (function(*=, *=): *)}}
 */
const anomalyFileReportService = {
  /**
   *
   * @param {Object} data
   * @param {function} logger
   * @return {Object[]}
   */
  detectAnomalies: function (row, logger) {
    const data = R.evolve(rowToDataTransformations, row)
    // console.log(`Transformed data is`, data)
    // run all anomaly detections against the data and return the result
    const raw = R.values(detections).map(f => f(data, logger))
    // Filter out any undefined responses
    return R.filter(isNotNil, raw)
  }
}

module.exports = anomalyFileReportService
