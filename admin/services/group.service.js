'use strict'

const groupDataService = require('../services/data-access/group.data.service')
const pupilDataService = require('../services/data-access/pupil.data.service')

const groupService = {}

groupService.getGroups = async function (query) {
  return groupDataService.getGroups(query)
}

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

groupService.getGroupById = async function (groupId) {
  if (!groupId) { return false }
  return groupDataService.getGroup({'_id': groupId})
}

groupService.getGroupByName = async function (groupName) {
  if (!groupName) { return false }
  return groupDataService.getGroup({'name': groupName})
}

module.exports = groupService
