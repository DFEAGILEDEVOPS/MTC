'use strict'

const { isNil } = require('ramda')
const { isFalse, isTrue, isPositive } = require('ramda-adjunct')
const moment = require('moment')
const R = require('ramda')

const logger = require('./log.service').getLogger()
const pupilStatusDataService = require('../services/data-access/pupil-status.data.service')
const pupilIdentificationFlagService = require('./pupil-identification-flag.service')
const settingService = require('./setting.service')
const tableSorting = require('../helpers/table-sorting')

const pupilStatusService = {
  /**
   * Return the pupil status data
   * @param schoolId
   * @return {Promise<*>}
   */
  getPupilStatusData: async function (schoolId) {
    if (!schoolId) {
      throw new Error('School id not found in session')
    }
    const settings = await settingService.get()
    const pupils = await pupilStatusDataService.sqlFindPupilsFullStatus(schoolId)
    const pupilsWithStatus = pupils.map(R.partial(pupilStatusService.addStatus, [settings]))
    return pupilIdentificationFlagService.addIdentificationFlags(tableSorting.applySorting(pupilsWithStatus, 'lastName'))
  },

  /**
   * Add the pupil `status` field, using the pupil register service to do so.
   * @param {Object} settings
   * @param {Object} pupil
   * @return {Object} partially cloned pupil obj with an additional `status` property
   */
  addStatus: function (settings, pupil) {
    const newPupil = R.pickAll(['pupilId', 'foreName', 'lastName', 'middleNames', 'dateOfBirth', 'urlSlug', 'checkStatusCode',
      'group_id', 'reason', 'reasonCode'], pupil)
    newPupil.status = pupilStatusService.getProcessStatusV2({
      attendanceId: pupil.attendanceId,
      checkComplete: pupil.checkComplete,
      checkReceived: pupil.checkReceived,
      checkStatusCode: pupil.checkStatusCode,
      currentCheckId: pupil.currentCheckId,
      notReceivedExpiryInMinutes: settings.checkTimeLimit,
      pinExpiresAt: pupil.pinExpiresAt,
      pupilCheckComplete: pupil.pupilCheckComplete,
      pupilId: pupil.pupilId,
      pupilLoginDate: pupil.pupilLoginDate,
      restartAvailable: pupil.restartAvailable
    })
    return newPupil
  },

  // TODO: Move to pupil status service
  /**
   * Return the process status using new pupil status fields
   * @param {ProcessStatusArg} arg object containing the parameters
   * @return {string}
   */
  getProcessStatusV2: function (arg) {
    let status = 'N/A'

    const {
      attendanceId,
      checkComplete,
      checkReceived,
      checkStatusCode,
      currentCheckId,
      notReceivedExpiryInMinutes,
      pinExpiresAt,
      pupilCheckComplete,
      pupilId,
      pupilLoginDate,
      restartAvailable,
      processingFailed
    } = arg

    if (pinExpiresAt && !moment.isMoment(pinExpiresAt)) {
      throw new Error('pinExpiresAt must be null or a Moment.moment datetime')
    }

    if (isPositive(attendanceId)) {
      status = 'Not taking the Check'
    } else if (isTrue(processingFailed)) {
      status = 'Error in processing'
    } else if (isTrue(restartAvailable)) {
      status = 'Restart'
    } else if ((isNil(currentCheckId) && isNil(checkStatusCode)) ||
      (isPositive(currentCheckId) && isNew(checkStatusCode) &&
        (isNil(pinExpiresAt) || isExpired(pinExpiresAt)))) {
      status = 'Not started'
    } else if (isPositive(currentCheckId) && isNew(checkStatusCode)) {
      status = 'PIN generated'
    } else if (isPositive(currentCheckId) && isCollected(checkStatusCode) && isFalse(checkReceived)) {
      status = 'Logged in'
      if (isNotReceived(pupilLoginDate, notReceivedExpiryInMinutes, moment.utc())) {
        status = 'Incomplete'
      }
    } else if (isTrue(checkReceived) && isFalse(checkComplete)) {
      status = 'Processing'
    } else if (isTrue(checkReceived) && isTrue(checkComplete) && isComplete(checkStatusCode) && isTrue(pupilCheckComplete)) {
      status = 'Complete'
    } else {
      logger.error(`getProcessStatusV2(): ERROR: Unable to determine status for pupil [${pupilId}] arg was: \n` +
        JSON.stringify(arg, ' ', 4))
    }
    return status
  }
}

const isNew = (str) => str === 'NEW'
const isCollected = (str) => str === 'COL'
const isComplete = (str) => str === 'CMP'

function isNotReceived (date, minutesToAdd, now) {
  if (!date || !moment.isMoment(date)) {
    // can be undefined
    return false
  }
  if (!now || !moment.isMoment(now)) {
    return false
  }
  if (!isPositive(minutesToAdd)) {
    throw new Error('minutesToAdd is not a positive number')
  }
  const expiry = date.add(minutesToAdd, 'minutes')
  return expiry.isBefore(now)
}

/**
 * Test to see if a date has already passed
 * @param {moment.isMoment} date
 * @return {boolean}
 */
function isExpired (date) {
  if (!moment.isMoment(date)) {
    throw new Error('isExpired: date is not a moment date')
  }
  return moment.utc().isAfter(date)
}

module.exports = pupilStatusService
