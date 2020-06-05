'use strict'

const groupDataService = require('../services/data-access/group.data.service')
const pupilIdentificationFlagService = require('../services/pupil-identification-flag.service')
const redisCacheService = require('../services/data-access/redis-cache.service')
const redisKeyService = require('../services/redis-key.service')

const groupService = {}

/**
 * Get groups.
 * @returns {Promise<Promise|*>}
 */
groupService.getGroups = async function (schoolId) {
  return groupDataService.sqlFindGroups(schoolId)
}

/**
 * Get groups with at least one pupil who isn't marked as not taking.
 * @returns {Promise<Promise|*>}
 */
groupService.getGroupsWithPresentPupils = async function (schoolId) {
  return groupDataService.sqlFindGroupsWithAtleastOnePresentPupil(schoolId)
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
  const groupsIndex = []
  const groups = await groupDataService.sqlFindGroups(schoolId)
  if (groups.length > 0) {
    groups.map((obj) => { groupsIndex[obj.id] = obj.name })
  }
  return groupsIndex
}

/**
 * Get pupils filtered by schoolId and groupId.
 * @param schoolId required.  the school context
 * @param groupIdToInclude optionally include a single group from the returned set
 * @returns {Promise<*>}
 */
groupService.getPupils = async function (schoolId, groupIdToInclude) {
  if (!schoolId) {
    throw new Error('schoolId is required')
  }
  const pupils = await groupDataService.sqlFindPupilsInNoGroupOrSpecificGroup(schoolId, groupIdToInclude)
  return pupilIdentificationFlagService.addIdentificationFlags(pupils)
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
  // The pupils come from the request and can be either an array of ids
  // or an object of the form { 'id': id }, we need to make sure they
  // are an array at this point for comparison.
  let { pupils } = group
  if (!(pupils instanceof Array)) {
    pupils = Object.values(pupils)
  }
  group.name = group.name.trim()
  await groupDataService.sqlUpdate(id, group.name, schoolId)
  let currentPupils = await groupService.getPupils(schoolId, id)
  currentPupils = currentPupils.filter(p => p.group_id && p.group_id.toString() === id.toString()).map(p => p.id)
  if (currentPupils.sort().toString() !== pupils.sort().toString()) {
    // only update pupils if list has changed
    await groupDataService.sqlModifyGroupMembers(id, pupils)
  }
  const pupilRegisterRedisKey = redisKeyService.getPupilRegisterViewDataKey(schoolId)
  await redisCacheService.drop(pupilRegisterRedisKey)
  return true
}

/**
 * Create group.
 * @param groupName
 * @param groupPupils
 * @param schoolId
 * @returns {Promise<number>} id of inserted group
 */
groupService.create = async (groupName, groupPupils, schoolId) => {
  if (!groupName || !schoolId) {
    throw new Error('groupName and schoolId are required')
  }
  groupName = groupName.trim()
  const newGroup = await groupDataService.sqlCreate({ name: groupName, school_id: schoolId })
  await groupDataService.sqlModifyGroupMembers(newGroup.insertId, groupPupils)
  const pupilRegisterRedisKey = redisKeyService.getPupilRegisterViewDataKey(schoolId)
  await redisCacheService.drop(pupilRegisterRedisKey)
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

/**
 * Remove existing group
 * @param schoolId
 * @param groupId
 * @returns {Promise<*>}
 */
groupService.remove = async (schoolId, groupId) => {
  if (!schoolId) {
    throw new Error('schoolId is required')
  }
  if (!groupId) {
    throw new Error('groupId is required')
  }
  const pupilRegisterRedisKey = redisKeyService.getPupilRegisterViewDataKey(schoolId)
  await redisCacheService.drop(pupilRegisterRedisKey)
  return groupDataService.sqlMarkGroupAsDeleted(groupId, schoolId)
}

module.exports = groupService
