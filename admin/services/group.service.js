'use strict'

const groupDataService = require('../services/data-access/group.data.service')
const pupilDataService = require('../services/data-access/pupil.data.service')

const groupService = {}

groupService.getGroups = async function (query) {
  return groupDataService.fetchGroups(query)
}

groupService.getPupils = async function (schoolId, groupIdToExclude) {
  if (!schoolId) { return false }
  let query = {}
  let filteredPupil = []
  let groupedPupils = []
  let pupils = await pupilDataService.getSortedPupils(schoolId)

  if (groupIdToExclude) {
    query = { '_id': { $ne: groupIdToExclude.toString() } }
  }
  const groups = await groupDataService.fetchGroups(query)
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

groupService.getGroupById = async function (groupId) {
  if (!groupId) { return false }
  return groupDataService.fetchGroup({'_id': groupId})
}

groupService.getGroupByName = async function (groupName) {
  if (!groupName) { return false }
  return groupDataService.fetchGroup({'name': groupName})
}

module.exports = groupService
