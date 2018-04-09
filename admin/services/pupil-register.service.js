'use strict'

const pupilService = require('../services/pupil.service')
const pupilStatusService = require('../services/pupil.status.service')
const pupilDataService = require('../services/data-access/pupil.data.service')
const groupService = require('../services/group.service')

const pupilRegisterService = {
  /**
   * Get list of register pupils.
   * @param dfeNumber
   * @param schoolId
   * @param sortDirection
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
   * Sorting.
   * @param pupilList
   * @param sortField
   * @param sortDirection
   * @returns {*}
   */
  sortPupils: (pupilList, sortField, sortDirection) => {
    // If sorting by 'status', use custom method.
    if (sortField === 'status') {
      return pupilService.sortByStatus(pupilList, sortDirection)
    }

    // If sorting by 'group', use custom method.
    if (sortField === 'group') {
      return pupilService.sortByGroup(pupilList, sortDirection)
    }
  }
}

module.exports = pupilRegisterService
