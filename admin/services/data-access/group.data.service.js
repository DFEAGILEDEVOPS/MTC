'use strict'

const Group = require('../../models/group')
const groupDataService = {}
const sqlService = require('./sql.service')
const TYPES = require('tedious').TYPES
const moment = require('moment')
const R = require('ramda')

/**
 * Get groups filtered by query.
 * @deprecated use sqlGetGroups
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
 * Get active groups (non-soft-deleted).
 * @returns {Promise<*>}
 */
groupDataService.sqlGetGroups = async () => {
  const sql = `SELECT g.* 
    FROM ${sqlService.adminSchema}.[group] g 
    WHERE g.isDeleted=0 
    ORDER BY name ASC`
  return sqlService.query(sql)
}

/**
 * Get group document by _id.
 * @deprecated use sqlGetGroup
 * @param query
 * @returns {Promise<*>}
 */
groupDataService.getGroup = async function (query) {
  return Group.findOne(query).lean().exec()
}

/**
 * Get group by id.
 * @param groupId
 * @returns {Promise<void>}
 */
groupDataService.sqlGetGroup = async (groupId) => {
  const sql = `SELECT g.* 
    FROM ${sqlService.adminSchema}.[group] g 
    WHERE g.id=@groupId`

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
 * @deprecated use sqlCreate
 * @param data
 * @returns {Promise<*>}
 */
groupDataService.create = async function (data) {
  const group = new Group(data)
  await group.save()
  return group.toObject()
}

/**
 * Create 'group' record.
 * @param group
 * @returns {Promise}
 */
groupDataService.sqlCreate = (group) => {
  return sqlService.create('[group]', group)
}

/**
 * Update 'group' record.
 * @deprecated use sqlUpdate
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

/**
 * @deprecated use sqlMarkGroupAsDeleted
 * @param {*} id 
 */
groupDataService.delete = async function (id) {
  return Group.updateOne({'_id': id}, {$set: {'isDeleted': true}}).exec()
}

/**
 * soft deletes a group
 * @param {number} groupId the id of the group to mark as deleted
 */
groupDataService.sqlMarkGroupAsDeleted = async (groupId) => {
  const params = [
    {
      name: 'groupId',
      value: groupId,
      type: TYPES.Int
    }
  ]
  await sqlService.modify(`DELETE ${sqlService.adminSchema}.[pupilGroup] WHERE group_id=@groupId`, params)
  return sqlService.update('[group]', { id: groupId, isDeleted: 1 })
}

module.exports = groupDataService
