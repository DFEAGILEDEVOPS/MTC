'use strict'

const Group = require('../../models/group')
const groupDataService = {}
const sqlService = require('./sql.service')
const TYPES = require('tedious').TYPES
const R = require('ramda')

/**
 * @TODO: To be deleted when the data layer refactoring is done.
 * Get groups filtered by query.
 * @param query
 * @returns {Promise<Promise|*>}
 */
groupDataService.getGroups = async function (query) {
  const q = query || {}
  q.isDeleted = false
  return Group
    .find(q)
    // @TODO: Collation won't work in Cosmos - This when migrating to SQL.
    // .collation({ locale: 'en', strength: 2 })
    .sort({ name: 'asc' })
    .lean()
    .exec()
}

/**
 * Get groups filtered by query.
 * @returns {Promise<*>}
 */
groupDataService.sqlGetGroups = async () => {
  const sql = `SELECT g.* FROM ${sqlService.adminSchema}.[group] WHERE isDeleted=0 SORT BY name ASC`
  return sqlService.query(sql)
}

/**
 * Get group document by _id.
 * @param query
 * @returns {Promise<*>}
 */
groupDataService.getGroup = async function (query) {
  return Group.findOne(query).lean().exec()
}

groupDataService.sqlGetGroup = async (groupId) => {
  const sql = `SELECT g.* FROM ${sqlService.adminSchema}.[group] g WHERE p.id=@groupId`
  const params = [
    {
      name: 'groupId',
      value: groupId,
      type: TYPES.Int
    }
  ]
  const result = await sqlService.query(sql, params)
  return R.head(result)
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

groupDataService.sqlCreate = (group) => {
  return sqlService.create('[group]', group)
}

/**
 * Update group.
 * @param id
 * @param data
 * @returns {Promise<void>}
 */
groupDataService.update = async function (id, data) {
  return new Promise((resolve, reject) => {
    Group.findByIdAndUpdate(
      id,
      {
        '$set': {
          'name': data.name,
          'pupils': data.pupils
        }
      }, function (error) {
        if (error) {
          return reject(error)
        }
      }
    )
    return resolve(data)
  })
}

// groupDataService.sqlUpdate = async (id, data) => {
//
// }

module.exports = groupDataService
