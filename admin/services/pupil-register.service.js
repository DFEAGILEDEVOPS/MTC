'use strict'

const { isNil } = require('ramda')
const { isFalse, isTrue, isPositive } = require('ramda-adjunct')
const moment = require('moment')

const pupilStatusService = require('../services/pupil.status.service')
const pupilDataService = require('../services/data-access/pupil.data.service')
const groupService = require('../services/group.service')
const pupilRegisterDataService = require('./data-access/pupil-register.data.service')
const pupilIdentificationFlagService = require('./pupil-identification-flag.service')
const settingService = require('./setting.service')

const pupilRegisterService = {
  /**
   * Get list of register pupils.
   * @param dfeNumber
   * @param schoolId
   * @param sortDirection
   * @deprecated
   * @returns {Promise<any>}
   */
  getPupils: async (dfeNumber, schoolId, sortDirection) => {
    const groupsIndex = await groupService.getGroupsAsArray(schoolId)
    const pupils = await pupilDataService.sqlFindPupilsBySchoolId(schoolId)

    return Promise.all(pupils.map(async (p, i) => {
      const { foreName, lastName, middleNames, dateOfBirth, urlSlug } = p
      const outcome = await pupilStatusService.getStatus(p)
      const group = groupsIndex[p.group_id] || '-'
      return {
        urlSlug,
        foreName,
        lastName,
        middleNames,
        dateOfBirth,
        group,
        outcome
      }
    }))
  },

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
          currentCheckId: d.currentCheckId,
          checkStatusCode: d.checkStatusCode,
          restartAvailable: d.restartAvailable,
          checkReceived: d.checkReceived,
          checkComplete: d.checkComplete,
          pupilLoginDate: d.pupilLoginDate,
          notReceivedExpiryInMinutes: settings.checkTimeLimit,
          pinExpiresAt: d.pinExpiresAt
        })
      }
    })

    return pupilIdentificationFlagService.addIdentificationFlags(pupilRegister)
  },

  /**
   * Return the 'process status' of the pupil for the GUI
   * @param pupilStatusCode
   * @param checkStatusCode
   * @param pupilRestartId
   * @param pupilRestartCheckId
   * @return {string}
   */
  getProcessStatus: function (pupilStatusCode, checkStatusCode, pupilRestartId, pupilRestartCheckId) {
    let status
    switch (pupilStatusCode) {
      case 'UNALLOC':
        status = 'Not started'
        break
      case 'ALLOC':
        status = 'PIN generated'
        break
      case 'LOGGED_IN':
        status = 'Logged in'
        break
      case 'STARTED':
        status = 'Check started'
        if (checkStatusCode === 'NTR') {
          status = 'Incomplete'
        }
        break
      case 'NOT_TAKING':
        status = 'Not taking the Check'
        break
      case 'COMPLETED':
        status = 'Complete'
        break
      default:
        status = ''
    }

    if (pupilRestartId && !pupilRestartCheckId) {
      // unconsumed restart
      status = 'Restart'
    }

    return status
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
      pupilCheckComplete,
      pupilLoginDate,
      pinExpiresAt,
      restartAvailable
    } = arg

    if (pinExpiresAt && !moment.isMoment(pinExpiresAt)) {
      throw new Error('pinExpiresAt must be null or a Moment.moment datetime')
    }

    if (isPositive(attendanceId)) {
      status = 'Not taking the check'
    } else if (isTrue(restartAvailable)) {
      status = 'Restart'
    } else if ((isNil(currentCheckId) && isNil(checkStatusCode)) ||
      (isPositive(currentCheckId) && isNew(checkStatusCode) &&
        (isNil(pinExpiresAt) || moment.utc().isAfter(pinExpiresAt)))) {
      status = 'Not Started'
    } else if (isPositive(currentCheckId) && isNew(checkStatusCode)) {
      status = 'PIN generated'
    } else if (isPositive(currentCheckId) && isCollected(checkStatusCode) && isFalse(checkReceived)) {
      status = 'Logged in'
      if (isNotReceived(pupilLoginDate, notReceivedExpiryInMinutes, moment.utc())) {
        status = 'Not received'
      }
    } else if (isTrue(checkReceived) && isTrue(checkComplete) && isComplete(checkStatusCode) && isTrue(pupilCheckComplete)) {
      status = 'Complete'
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
    // can be undefiend
    return false
  }
  if (!now || !moment.isMoment(now)) {
    return false
  }
  if (!isPositive(minutesToAdd)) {
    throw new Error('minutesToAdd is not a positive number')
  }
  const expiry = date.add(minutesToAdd, 'minutes')
  if (expiry.isBefore(now)) {
    return true
  }
  return false
}

module.exports = pupilRegisterService
