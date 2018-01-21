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
 * Get group by name.
 * @param groupName
 * @returns {Promise<void>}
 */
groupDataService.sqlGetGroupByName = async (groupName) => {
  const sql = `SELECT g.* 
    FROM ${sqlService.adminSchema}.[group] g 
    WHERE isDeleted=0
    AND g.name=@groupName`

  const params = [
    {
      name: 'groupName',
      value: groupName,
      type: TYPES.NVarChar
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
 * Update group.
 * @param id
 * @param name
 * @returns {Promise}
 */
groupDataService.sqlUpdate = async (id, name) => {
  const params = [
    {
      name: 'id',
      value: id,
      type: TYPES.Int
    },
    {
      name: 'name',
      value: name,
      type: TYPES.NVarChar
    },
    {
      name: 'updatedAt',
      value: moment.utc(),
      type: TYPES.DateTimeOffset
    }
  ]
  return sqlService.modify(
    `UPDATE ${sqlService.adminSchema}.[group] 
    SET name=@name, updatedAt=@updatedAt 
    WHERE [id]=@id`,
    params)
}

/**
 * Get pupils per group.
 * @returns {Promise<*>}
 */
groupDataService.getPupilsPerGroup = async () => {
  const sql = `SELECT group_id, COUNT (pupil_id) AS total_pupils 
    FROM ${sqlService.adminSchema}.[pupilGroup] 
    GROUP BY group_id`
  return sqlService.query(sql)
}

/**
 * Update pupils assigned to group.
 * @param groupId
 * @param pupilIds
 * @returns {Promise<void>}
 */
groupDataService.sqlAssignPupilsToGroup = async (groupId, pupilIds) => {
  // First, delete all pupils for the selected groupId
  const sqlDelete = `DELETE FROM ${sqlService.adminSchema}.[pupilGroup] 
    WHERE group_id=@groupId`

  const paramsDel = [
    {
      name: 'groupId',
      value: groupId,
      type: TYPES.Int
    }
  ]
  await sqlService.modify(sqlDelete, paramsDel)

  // Next, insert passed pupils
  if (pupilIds.length > 0) {
    let sqlInsert = ''
    let paramsInsert

    pupilIds.forEach(async p => {
      if (p) {
        paramsInsert = [
          {
            name: 'groupId',
            value: groupId,
            type: TYPES.Int
          },
          {
            name: 'pupilId',
            value: p,
            type: TYPES.Int
          }
        ]

        // @TODO: This can be improved to avoid the loop with a syntax as follows:
        // INSERT INTO #SQLAuthority (ID, Value)
        // VALUES (1, 'First'), (2, 'Second'), (3, 'Third');
        sqlInsert = `INSERT INTO ${sqlService.adminSchema}.[pupilGroup] (group_id, pupil_id) VALUES (@groupId, @pupilId)`
        await sqlService.modify(sqlInsert, paramsInsert)
      }
    })
  }
}

/**
 * Get pupils filtered by schoolId and/or groupId.
 * and grouped by group_id.
 * @param schoolId
 * @param groupId
 * @returns {Promise<*>}
 */
groupDataService.sqlGetPupils = async (schoolId, groupId) => {
  let params = [
    {
      name: 'schoolId',
      value: schoolId,
      type: TYPES.Int
    }
  ]

  let sql = `SELECT p.[id], p.[foreName], p.[middleNames], p.[lastName], g.[group_id]
    FROM ${sqlService.adminSchema}.[pupil] p 
    LEFT JOIN ${sqlService.adminSchema}.[pupilGroup] g 
      ON p.id = g.pupil_id 
    WHERE p.school_id=@schoolId 
    AND g.group_id IS NULL`

  if (groupId) {
    params.push({
      name: 'groupId',
      value: groupId,
      type: TYPES.Int
    })
    sql += ` OR g.group_id=@groupId`
  }

  return sqlService.query(sql, params)
}

/**
 * Soft-deletes a group.
 * @deprecated use sqlMarkGroupAsDeleted
 * @param id
 * @returns {Promise<void>}
 */
groupDataService.delete = async function (id) {
  return Group.updateOne({'_id': id}, {$set: {'isDeleted': true}}).exec()
}

/**
 * Soft deletes a group.
 * @param {number} groupId the id of the group to mark as deleted
 * @returns {Promise<*>}
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
