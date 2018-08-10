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
 * Get groups and format them as an array.
 * @param schoolId
 * @returns {Promise<*>}
 */
groupService.getGroupsAsArray = async function (schoolId) {
  if (!schoolId) {
    throw new Error('schoolId is required')
  }
  let groupsIndex = []
  let groups
  groups = await groupDataService.sqlFindGroups(schoolId)
  if (groups.length > 0) {
    groups.map((obj) => { groupsIndex[obj.id] = obj.name })
  }
  return groupsIndex
}

/**
 * Get pupils filtered by schoolId and groupId.
 * @param schoolId required.  the school context
 * @param groupIdToExclude optionally exclude a single group from the returned set
 * @returns {Promise<*>}
 */
groupService.getPupils = async function (schoolId, groupIdToExclude) {
  if (!schoolId) {
    throw new Error('schoolId is required')
  }
  return groupDataService.sqlFindPupils(schoolId, groupIdToExclude)
}

/**
 * Get group by id.
 * @param groupId
 * @param schoolId
 * @returns {Promise<*>}
 */
groupService.getGroupById = async function (groupId, schoolId) {
  if (!schoolId || !groupId) {
    throw new Error('schoolId and groupId are required')
  }
  return groupDataService.sqlFindOneById(groupId, schoolId)
}

/**
 * Update group (group and pupils assigned to groups).
 * @param id
 * @param group
 * @param schoolId
 * @returns {Promise<boolean>}
 */
groupService.update = async (id, group, schoolId) => {
  if (!id || !group || !group.name || !schoolId) {
    throw new Error('id, group.name and schoolId are required')
  }
  await groupDataService.sqlUpdate(id, group.name, schoolId)
  return groupDataService.sqlAssignPupilsToGroup(id, group.pupils)
}

/**
 * Create group.
 * @param groupName
 * @param groupPupils
 * @param schoolId
 * @returns {number} id of inserted group
 */
groupService.create = async (groupName, groupPupils, schoolId) => {
  if (!groupName || !schoolId) {
    throw new Error('groupName and schoolId are required')
  }
  const newGroup = await groupDataService.sqlCreate({ name: groupName, school_id: schoolId })
  await groupDataService.sqlAssignPupilsToGroup(newGroup.insertId, groupPupils)
  return newGroup.insertId
}

/**
 * Find groups that have pupils that can get PINs assigned.
 * @param schoolId
 * @param pupils
 * @returns {Promise<*>}
 */
groupService.findGroupsByPupil = async (schoolId, pupils) => {
  if (!schoolId || !pupils || (pupils && pupils.length < 1)) {
    throw new Error('schoolId and pupils are required')
  }
  return groupDataService.sqlFindGroupsByIds(schoolId, pupils)
}

/**
 * Find and assign groups to pupils based on the schoolId
 * @param schoolId
 * @param pupils
 * @returns {Promise<*>}
 */
groupService.assignGroupsToPupils = async (schoolId, pupils) => {
  if (!schoolId || !pupils || (pupils && pupils.length < 1)) {
    return pupils
  }
  const groups = await groupService.getGroupsAsArray(schoolId)
  if (groups && groups.length < 1) {
    return pupils
  }
  return pupils.map(p => {
    p.group = groups[p.group_id] || ''
    return p
  })
}

module.exports = groupService
