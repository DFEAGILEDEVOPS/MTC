'use strict'

const groupDataService = require('../services/data-access/group.data.service')
const groupService = {}

/**
 * Get groups.
 * @param query
 * @returns {Promise<Promise|*>}
 */
groupService.getGroups = async function (query) {
  // @TODO: TO BE DELETED
  // return groupDataService.getGroups(query)
  return groupDataService.sqlGetGroups()
}

/**
 * Get pupils filtered by schoolId and groupId.
 * @param schoolId
 * @param groupIdToExclude
 * @returns {Promise<*>}
 */
groupService.getPupils = async function (schoolId, groupIdToExclude) {
  if (!schoolId) { return false }
  return groupDataService.sqlGetPupils(schoolId, groupIdToExclude)

  // @TODO: TO BE DELETED
  // if (!schoolId) { return false }
  // let query = {}
  // let filteredPupil = []
  // let groupedPupils = []
  // let pupils = await pupilDataService.getSortedPupils(schoolId)
  //
  // if (groupIdToExclude) {
  //   query = { '_id': { $ne: groupIdToExclude } }
  // }
  // const groups = await groupDataService.getGroups(query)
  // groups.map((group) => {
  //   const pupils = Object.values(group.pupils)
  //   pupils.forEach(id => {
  //     return groupedPupils.push(id)
  //   })
  // })
  //
  // pupils.map((pupil) => {
  //   if (!groupedPupils.includes(pupil._id.toString())) {
  //     filteredPupil.push(pupil)
  //   }
  // })
  //
  // return filteredPupil
}

/**
 * Get group by id.
 * @param groupId
 * @returns {Promise<*>}
 */
groupService.getGroupById = async function (groupId) {
  if (!groupId) { return false }
  // @TODO: TO BE DELETED
  // return groupDataService.getGroup({'_id': groupId})
  return groupDataService.sqlGetGroup(groupId)
}

/**
 * Get group by name.
 * @param groupName
 * @returns {Promise<*>}
 */
groupService.getGroupByName = async function (groupName) {
  if (!groupName) { return false }
  return groupDataService.sqlGetGroup({'name': groupName})
}

/**
 * Update group (group and pupils assigned to groups).
 * @param id
 * @param group
 * @returns {Promise<boolean>}
 */
groupService.updateGroup = async (id, group) => {
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
 * @param group
 * @returns {Promise<boolean>}
 */
groupService.create = async (group, groupPupils) => {
  if (!group) { return false }
  return new Promise(async (resolve, reject) => {
    try {
      const newGroup = await groupDataService.sqlCreate(group)
      await groupDataService.sqlAssignPupilsToGroup(newGroup.insertId, groupPupils)
      resolve(group)
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = groupService
