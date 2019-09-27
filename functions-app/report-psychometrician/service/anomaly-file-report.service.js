'use strict'

const moment = require('moment')
const R = require('ramda')

const detections = {
  detectWrongNumberOfAnswers: require('./detections/detect-wrong-number-of-answers'),
  detectLowBattery: require('./detections/detect-low-battery'),
  detectInputBeforeTheQuestionIsShown: require('./detections/detect-input-before-question-is-shown')
}

const rowToDataTransformations = {
  checkPayload: JSON.parse,
  markedAnswers: JSON.parse,
  checkCreatedAt: moment,
  checkStartedAt: moment
}

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
    // run all anomaly detections against the data and return the result
    return R.values(detections).map(f => f(data, logger))
  }
}

module.exports = anomalyFileReportService
