'use strict'

const groupDataService = require('../services/data-access/group.data.service')
const pupilDataService = require('../services/data-access/pupil.data.service')

const groupService = {}

groupService.getGroups = async function (query) {
  return groupDataService.fetchGroups(query)
}

groupService.getPupils = async function (schoolId) {
  if (!schoolId) { return false }
  return pupilDataService.getSortedPupils(schoolId)
}

groupService.getGroupById = async function (groupId) {
  if (!groupId) { return false }
  return groupDataService.fetchGroup({'_id': groupId})
}

groupService.getGroupByName = async function (groupName) {
  if (!groupName) { return false }
  return groupDataService.fetchGroup({'name': groupName})
}

module.exports = groupService
