'use strict'

const groupDataService = require('../services/data-access/group.data.service')
const groupService = {}

/**
 * Get groups.
 * @returns {Promise<Promise|*>}
 */
groupService.getGroups = async function () {
  return groupDataService.sqlFindGroups()
}

/**
 * Get pupils filtered by schoolId and groupId.
 * @param schoolId
 * @param groupIdToExclude
 * @returns {Promise<*>}
 */
groupService.getPupils = async function (schoolId, groupIdToExclude) {
  if (!schoolId) { return false }
  return groupDataService.sqlFindPupils(schoolId, groupIdToExclude)
}

/**
 * Get group by id.
 * @param groupId
 * @returns {Promise<*>}
 */
groupService.getGroupById = async function (groupId) {
  if (!groupId) { return false }
  return groupDataService.sqlFindGroup(groupId)
}

/**
 * Update group (group and pupils assigned to groups).
 * @param id
 * @param group
 * @returns {Promise<boolean>}
 */
groupService.update = async (id, group) => {
  if (!id || !group || !group.name) { return false }
  return new Promise(async (resolve, reject) => {
    try {
      await groupDataService.sqlUpdate(id, group.name)
      await groupDataService.sqlAssignPupilsToGroup(id, group.pupils)
      resolve(group)
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Create group.
 * @param groupName
 * @param groupPupils
 * @returns {number} id of inserted group
 */
groupService.create = async (groupName, groupPupils) => {
  if (!groupName) { return false }
  try {
    const newGroup = await groupDataService.sqlCreate({ name: groupName })
    await groupDataService.sqlAssignPupilsToGroup(newGroup.insertId, groupPupils)
    return newGroup.insertId
  } catch (error) {
    throw new Error('Failed to create group')
  }
}

/**
 * Get pupils per group.
 * @returns {Promise<Array>}
 */
groupService.getPupilsPerGroup = async () => {
  let data = await groupDataService.sqlFindPupilsPerGroup()
  let pupilsPerGroup = []
  data.map((g) => { pupilsPerGroup[g.group_id] = g.total_pupils })
  return pupilsPerGroup
}

module.exports = groupService
