'use strict'

const pupilService = require('../services/pupil.service')
const pupilStatusService = require('../services/pupil.status.service')
const pupilDataService = require('../services/data-access/pupil.data.service')
const groupService = require('../services/group.service')
const pupilRegisterDataService = require('./data-access/pupil-register.data.service')
const pupilIdentificationFlagService = require('./pupil-identification-flag.service')

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
    const pupils = await pupilDataService.sqlFindPupilsByDfeNumber(dfeNumber, sortDirection)

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
    const pupilRegisterData = await pupilRegisterDataService.getPupilRegister(schoolId)
    const pupilRegister = pupilRegisterData.map(d => {
      return {
        urlSlug: d.urlSlug,
        foreName: d.foreName,
        lastName: d.lastName,
        middleNames: d.middleNames,
        dateOfBirth: d.dateOfBirth,
        group: d.groupName,
        outcome: pupilRegisterService.getProcessStatus(
          d.pupilStatusCode,
          d.lastCheckStatusCode,
          d.pupilRestartId,
          d.pupilRestartCheckId)
      }
    })
    pupilIdentificationFlagService.addIdentificationFlags(pupilRegister)
    return pupilRegister
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
  }
}

module.exports = pupilRegisterService
