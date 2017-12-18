'use strict'

const Group = require('../../models/group')
const groupDataService = {}

/**
 * Get groups filtered by query.
 * @param query
 * @returns {Promise<Promise|*>}
 */
groupDataService.fetchGroups = async function (query) {
  const q = query || {}
  q.isDeleted = false
  return Group.find(q).sort({ name: 'asc' }).lean().exec()
}

module.exports = groupDataService
