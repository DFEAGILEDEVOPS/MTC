'use strict'

const groupDataService = require('../services/data-access/group.data.service')

const groupService = {}

groupService.getGroups = async function (query) {
  return groupDataService.fetchGroups(query)
}

module.exports = groupService
