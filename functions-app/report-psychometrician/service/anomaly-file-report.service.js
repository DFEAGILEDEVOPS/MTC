'use strict'

const moment = require('moment')
const R = require('ramda')

const detections = {
  detectWrongNumberOfAnswers: require('./detections/detect-wrong-number-of-answers'),
  detectLowBattery: require('./detections/detect-low-battery'),
  detectChecksThatTookTooLong: require('./detections/detect-check-took-too-long'),
  detectInputBeforeTheQuestionIsShown: require('./detections/detect-input-before-question-is-shown'),
  detectInputAfterTheTimerHasCompleted: require('./detections/detect-input-after-the-timer-has-completed'),
  detectAnswersAfterTheCutoff: require('./detections/detect-answer-responses-after-cutoff'),
  detectPupilPrefsAfterCheckStart: require('./detections/detect-pupil-prefs-after-check-start'),
  detectDuplicateAnswerError: require('./detections/detect-duplicate-answer-events')
}

const rowToDataTransformations = {
  checkPayload: (s) => { try { return JSON.parse(s) } catch (unhandled) { return '' } },
  markedAnswers: (s) => { try { return JSON.parse(s) } catch (unhandled) { return '' } },
  checkCreatedAt: (s) => { return s && moment(s) },
  checkStartedAt: (s) => { return s && moment(s) }
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
    if (row.attendanceCode) {
      // don't attempt anomaly detection if there is an attendance code
      console.log('returning early jms', row)
      return []
    }
    const data = R.evolve(rowToDataTransformations, row)
    // run all anomaly detections against the data and return the result
    return R.values(detections).map(f => f(data, logger))
  }
}

module.exports = anomalyFileReportService
