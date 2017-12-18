'use strict'

const groupDataService = require('../services/data-access/group.data.service')

const groupService = {

  getGroups: async function (query) {
    let groups
    try {
      groups = await groupDataService.fetchGroups(query)
    } catch (error) {
      throw new Error(error)
    }
    return groups || []
  }
}

module.exports = groupService
