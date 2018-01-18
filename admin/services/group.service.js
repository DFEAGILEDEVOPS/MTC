'use strict'

const groupDataService = require('../services/data-access/group.data.service')
const pupilDataService = require('../services/data-access/pupil.data.service')

const groupService = {}

/**
 * Get groups.
 * @param query
 * @returns {Promise<Promise|*>}
 */
groupService.getGroups = async function (query) {
  return groupDataService.getGroups(query)
}

/**
 * Get pupils that are not in group to exclude.
 * @param schoolId
 * @param groupIdToExclude
 * @returns {Promise<*>}
 */
groupService.getPupils = async function (schoolId, groupIdToExclude) {
  if (!schoolId) { return false }
  let query = {}
  let filteredPupil = []
  let groupedPupils = []
  let pupils = await pupilDataService.getSortedPupils(schoolId)

  if (groupIdToExclude) {
    query = { '_id': { $ne: groupIdToExclude } }
  }
  const groups = await groupDataService.getGroups(query)
  groups.map((group) => {
    const pupils = Object.values(group.pupils)
    pupils.forEach(id => {
      return groupedPupils.push(id)
    })
  })

  pupils.map((pupil) => {
    if (!groupedPupils.includes(pupil._id.toString())) {
      filteredPupil.push(pupil)
    }
  })

  return filteredPupil
}

/**
 * Get group by id.
 * @param groupId
 * @returns {Promise<*>}
 */
groupService.getGroupById = async function (groupId) {
  if (!groupId) { return false }
  return groupDataService.getGroup({'_id': groupId})
}

/**
 * Get group by name.
 * @param groupName
 * @returns {Promise<*>}
 */
groupService.getGroupByName = async function (groupName) {
  if (!groupName) { return false }
  return groupDataService.getGroup({'name': groupName})
}

/**
 * Update group (group and pupils assigned to groups).
 * @param id
 * @param data
 * @returns {Promise<boolean>}
 */
groupService.updateGroup = async function (id, data) {
  if (!id || !data || !data.name) { return false }
  return new Promise(async (resolve, reject) => {
    try {
      await groupDataService.sqlUpdateGroup(id, data.name)
      // @TODO: add updating pupils assigned to group.
      resolve(data)
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = groupService
