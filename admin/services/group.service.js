'use strict'

const groupDataService = require('../services/data-access/group.data.service')
const pupilDataService = require('../services/data-access/pupil.data.service')

const groupService = {}

groupService.getGroups = async function (query) {
  return groupDataService.fetchGroups(query)
}

groupService.getPupils = async function (schoolId) {
  if (!schoolId) {
    return false
  }
  return pupilDataService.getSortedPupils(schoolId)
}
module.exports = groupService
