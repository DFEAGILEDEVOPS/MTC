'use strict'

const groupDataService = require('../services/data-access/group.data.service')
const groupService = {}

/**
 * Get groups.
 * @returns {Promise<Promise|*>}
 */
groupService.getGroups = async function (schoolId) {
  return groupDataService.sqlFindGroups(schoolId)
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
groupService.getGroupById = async function (groupId, schoolId) {
  if (!groupId) { return false }
  return groupDataService.sqlFindGroup(groupId, schoolId)
}

/**
 * Update group (group and pupils assigned to groups).
 * @param id
 * @param group
 * @returns {Promise<boolean>}
 */
groupService.update = async (id, group, schoolId) => {
  if (!id || !group || !group.name) { return false }
  return new Promise(async (resolve, reject) => {
    try {
      await groupDataService.sqlUpdate(id, group.name, schoolId)
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
groupService.create = async (groupName, groupPupils, schoolId) => {
  if (!groupName) { return false }
  try {
    const newGroup = await groupDataService.sqlCreate({ name: groupName, school_id: schoolId })
    await groupDataService.sqlAssignPupilsToGroup(newGroup.insertId, groupPupils)
    return newGroup.insertId
  } catch (error) {
    throw new Error('Failed to create group')
  }
}

module.exports = groupService
