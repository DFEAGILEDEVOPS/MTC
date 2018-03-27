'use strict'

const pupilStatusService = require('../services/pupil.status.service')
const pupilDataService = require('../services/data-access/pupil.data.service')
const groupService = require('../services/group.service')

const pupilRegisterService = {

  /**
   * Find a School by the id.
   * @param dfeNumber
   * @param schoolId
   * @param sortDirection
   * @returns {Promise<Array>}
   */
  findPupils: async (dfeNumber, schoolId, sortDirection) => {
    let groupsIndex = []
    let pupilsFormatted = []

    try {
      groupsIndex = await groupService.getGroupsAsArray(schoolId)
      const pupils = await pupilDataService.sqlFindPupilsByDfeNumber(dfeNumber, sortDirection)

      return pupils.map(async (p, i) => {
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
      })

      // pupilsFormatted = await Promise.all(pupils.map(async (p, i) => {
      //   const { foreName, lastName, middleNames, dateOfBirth, urlSlug } = p
      //   const outcome = await pupilStatusService.getStatus(p)
      //   const group = groupsIndex[p.group_id] || '-'
      //   return {
      //     urlSlug,
      //     foreName,
      //     lastName,
      //     middleNames,
      //     dateOfBirth,
      //     group,
      //     outcome
      //   }
      // })
      // ).catch(error => {
      //   throw new Error(`Error building list of registered users ${error}`)
      // })
    } catch (error) {
      throw new Error(`Error building list of registered users ${error}`)
    }

    // return pupilsFormatted
  }
}

module.exports = pupilRegisterService
