'use strict'

const Group = require('../../models/group')
const groupDataService = {}

/**
 * Get groups filtered by query.
 * @param query
 * @returns {Promise<Promise|*>}
 */
groupDataService.fetchGroups = async function (query) {
  let sort = {}
  let q = query || {}

  sort['name'] = 'asc'
  q.isDeleted = false

  return Group.find(q).sort(sort).lean().exec()
}

module.exports = groupDataService
