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
  const overdueLoggedIn = 'Overdue - signed in check not started'
  const overdueStarted = 'Overdue - check started but not received'
  const notStarted = 'Not started'

  pupilStatusViewData.pupilsRequireAction = R.filter(p => R.includes(p.status, ['Error in processing', overdueLoggedIn, overdueStarted], p), pupilStatusData)

  pupilStatusViewData.pupilsNotStarted = pupilStatusPresenter.applyStatusDescriptionChange(
    R.filter(p => R.includes(p.status, [notStarted, 'Restart'], p), pupilStatusData),
    ['Restart'],
    'Restart applied'
  )

  pupilStatusViewData.pupilsInProgress = R.filter(p => R.includes(p.status, ['PIN generated', 'Signed in', 'Check processing', 'Check in progress'], p), pupilStatusData)
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
 * @param {String} newStatusDescription
 * @returns {Array}
 */
pupilStatusPresenter.applyStatusDescriptionChange = (pupilData, statuses, newStatusDescription) => {
  const changeDescription = p => {
    if (statuses.includes(p.status)) {
      p.status = newStatusDescription
    }
    return p
  }
  return R.map(p => changeDescription(p), pupilData)
}

module.exports = pupilStatusPresenter
