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

/**
 * Get group document by _id.
 * @param id
 * @returns {Promise<*>}
 */
groupDataService.fetchGroup = async function (id) {
  return Group.findOne({'_id': id}).lean().exec()
}

/**
 * Save group.
 * @param data
 * @returns {Promise<*>}
 */
groupDataService.create = async function (data) {
  const group = new Group(data)
  await group.save()
  return group.toObject()
}

module.exports = groupDataService
