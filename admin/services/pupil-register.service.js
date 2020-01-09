'use strict'

const { isNil } = require('ramda')
const { isFalse, isTrue, isPositive } = require('ramda-adjunct')
const moment = require('moment')

const pupilRegisterDataService = require('./data-access/pupil-register.data.service')
const pupilIdentificationFlagService = require('./pupil-identification-flag.service')
const settingService = require('./setting.service')
const logger = require('./log.service').getLogger()

const pupilRegisterService = {
  /**
   * Return the pupil register
   * @param schoolId
   * @return {Promise<*>}
   */
  getPupilRegister: async function (schoolId) {
    if (!schoolId) {
      throw new Error('School id not found in session')
    }
    return this.getPupilRegisterViewData(schoolId)
  },

  /**
   * Store the pupil register view data in redis and return the data set
   * @param {Number} schoolId
   * @return {Array}
   */
  getPupilRegisterViewData: async function (schoolId) {
    const pupilRegisterData = await pupilRegisterDataService.getPupilRegister(schoolId)
    const settings = await settingService.get()

    const pupilRegister = pupilRegisterData.map(d => {
      return {
        urlSlug: d.urlSlug,
        foreName: d.foreName,
        lastName: d.lastName,
        middleNames: d.middleNames,
        dateOfBirth: d.dateOfBirth,
        upn: d.upn,
        group: d.groupName,
        outcome: pupilRegisterService.getProcessStatusV2({
          attendanceId: d.attendanceId,
          checkComplete: d.checkComplete,
          checkReceived: d.checkReceived,
          checkStatusCode: d.checkStatusCode,
          currentCheckId: d.currentCheckId,
          notReceivedExpiryInMinutes: settings.checkTimeLimit,
          pinExpiresAt: d.pinExpiresAt,
          pupilCheckComplete: d.pupilCheckComplete,
          pupilId: d.pupilId,
          pupilLoginDate: d.pupilLoginDate,
          restartAvailable: d.restartAvailable
        })
      }
    })

    return pupilIdentificationFlagService.addIdentificationFlags(pupilRegister)
  },

  /**
   * @typedef {Object} ProcessStatusArg
   * @property {Number | null} attendanceId
   * @property {Number | null} currentCheckId
   * @property {String | null} checkStatusCode
   * @property {Boolean} restartAvailable
   * @property {Boolean} checkComplete
   * @property {Boolean} checkReceived
   * @property {Moment.moment | null} pupilLoginDate
   * @property {Number} notReceivedExpiryInMinutes
   * @property {Boolean} pupilCheckComplete - pupil.checkComplete flag
   * @property {Moment.moment | null} pinExpiresAt - the date and time in utc the pin expires (and therefore the check)
   * @property {Number} pupilId - the pupil ID.  Used for support diagnostics only.
   */

  /**
   * Return the process status using new pupil status fields
   * @param {ProcessStatusArg} an object containing the parameters
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
      restartAvailable
    } = arg

    if (pinExpiresAt && !moment.isMoment(pinExpiresAt)) {
      throw new Error('pinExpiresAt must be null or a Moment.moment datetime')
    }

    if (isPositive(attendanceId)) {
      status = 'Not taking the Check'
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
    } else if (isTrue(checkReceived) && isTrue(checkComplete) && isComplete(checkStatusCode) && isTrue(pupilCheckComplete)) {
      status = 'Complete'
    } else {
      logger.error(`getProcessStatusV2(): ERROR: Unable to determine status for pupil [${pupilId}] arg was: \n` +
        JSON.stringify(arg, ' ', 4))
    }

    return status
  },

  /**
   * Identifies whether school's register has incomplete checks.
   * @param {number} schoolId
   * @return {boolean}
   */
  hasIncompleteChecks: async function (schoolId) {
    const result = await pupilRegisterDataService.getIncompleteChecks(schoolId)
    return Array.isArray(result) && result.length > 0
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

module.exports = pupilRegisterService
