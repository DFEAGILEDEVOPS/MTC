'use strict'

const R = require('ramda')
const moment = require('moment')
const dateService = require('../services/date.service')

const pupilStatusPresenter = {}

/**
 * Fetch pupil status view data
 * @param {Array} pupilStatusData
 * @param {Object} checkWindowData
 * @returns {Object} pupilStatusViewData
 */
pupilStatusPresenter.getPresentationData = (pupilStatusData, checkWindowData) => {
  const pupilStatusViewData = {}
  pupilStatusViewData.pupilsWithErrors = R.filter(p => pupilStatusPresenter.findPupilsByCategory(['Error in processing', 'Incomplete'], p), pupilStatusData)
  pupilStatusViewData.pupilsNotStarted = R.filter(p => pupilStatusPresenter.findPupilsByCategory(['Not started', 'Processing'], p), pupilStatusData)
  pupilStatusViewData.pupilsNotAttending = R.filter(p => !!p.reason, pupilStatusData)
  pupilStatusViewData.pupilsCompleted = R.filter(p => pupilStatusPresenter.findPupilsByCategory(['Complete'], p), pupilStatusData)

  pupilStatusViewData.pupilsWithErrorsCount = pupilStatusViewData.pupilsWithErrors.length || 0
  pupilStatusViewData.pupilsNotStartedCount = pupilStatusViewData.pupilsNotStarted.length || 0
  pupilStatusViewData.pupilsNotAttendingCount = pupilStatusViewData.pupilsNotAttending.length || 0
  pupilStatusViewData.pupilsCompletedCount = pupilStatusViewData.pupilsCompleted.length || 0
  pupilStatusViewData.totalPupilsCount = pupilStatusData.length || 0

  pupilStatusViewData.liveCheckEndDate = dateService.formatFullGdsDate(checkWindowData.checkEndDate)
  pupilStatusViewData.remainingLiveCheckDays = checkWindowData.checkEndDate.diff(checkWindowData.checkStartDate, 'days')
  return pupilStatusViewData
}

pupilStatusPresenter.findPupilsByCategory = (categories, pupil) => R.includes(pupil.status, categories)

module.exports = pupilStatusPresenter
