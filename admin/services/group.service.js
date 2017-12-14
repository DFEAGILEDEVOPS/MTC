'use strict'

const groupDataService = require('../services/data-access/group.data.service')

const groupService = {

  getGroups: async function (query) {
    let groups
    groups = await groupDataService.fetchGroups(query)
    return groups || []
  }
}

module.exports = groupService
