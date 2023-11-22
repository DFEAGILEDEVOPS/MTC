'use strict'

const moment = require('moment')
const R = require('ramda')
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
  pupilStatusViewData.pupilsRequireAction = pupilStatusPresenter.applyStatusDescriptionChange(
    // @ts-ignore
    R.filter(p => R.includes(p.status, ['Error in processing', 'Overdue'], p), pupilStatusData),
    ['Overdue'],
    'Pupil check not received'
  )
  pupilStatusViewData.pupilsNotStarted = pupilStatusPresenter.applyStatusDescriptionChange(
    // @ts-ignore
    R.filter(p => R.includes(p.status, ['Not started', 'Restart'], p), pupilStatusData),
    ['Restart'],
    'Not started'
  )
  pupilStatusViewData.pupilsInProgress = R.filter(p => R.includes(p.status, ['PIN generated', 'Logged in', 'Processing'], p), pupilStatusData)
  // @ts-ignore
  pupilStatusViewData.pupilsCompleted = R.filter(p => R.includes(p.status, ['Complete'], p) || !!p.reason, pupilStatusData)

  pupilStatusViewData.pupilsRequireActionCount = pupilStatusViewData.pupilsRequireAction.length || 0
  pupilStatusViewData.pupilsNotStartedCount = pupilStatusViewData.pupilsNotStarted.length || 0
  pupilStatusViewData.pupilsInProgressCount = pupilStatusViewData.pupilsInProgress.length || 0
  pupilStatusViewData.pupilsCompletedCount = pupilStatusViewData.pupilsCompleted.length || 0
  pupilStatusViewData.totalPupilsCount = pupilStatusData.length || 0

  pupilStatusViewData.liveCheckEndDate = dateService.formatFullGdsDate(checkWindowData.checkEndDate)
  pupilStatusViewData.remainingLiveCheckDays = checkWindowData.checkEndDate.diff(moment.utc(), 'days')
  return pupilStatusViewData
}

/**
 * Change status description for specific pupil statuses
 * @param {Array} pupilData
 * @param {Array} statuses
 * @param {String} statusDescription
 * @returns {Array}
 */
pupilStatusPresenter.applyStatusDescriptionChange = (pupilData, statuses, statusDescription) => {
  const changeDescription = p => {
    if (statuses.includes(p.status)) {
      p.status = statusDescription
    }
    return p
  }
  return R.map(p => changeDescription(p), pupilData)
}

module.exports = pupilStatusPresenter
