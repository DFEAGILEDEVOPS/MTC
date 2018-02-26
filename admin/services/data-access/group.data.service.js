'use strict'

const groupDataService = {}
const sqlService = require('./sql.service')
const TYPES = require('tedious').TYPES
const R = require('ramda')

/**
 * Get active groups (non-soft-deleted).
 * @returns {Promise<*>}
 */
groupDataService.sqlFindGroups = async (schoolId) => {
  const sql = `
  SELECT g.id, g.name, COUNT(pg.pupil_id) as pupilCount 
  FROM ${sqlService.adminSchema}.[group] g
  LEFT OUTER JOIN ${sqlService.adminSchema}.pupilGroup pg 
  ON g.id = pg.group_id
  WHERE g.isDeleted=0
  AND g.school_id=@schoolId
  GROUP BY g.id, g.name
  ORDER BY name ASC`
  const params = [
    {
      name: 'schoolId',
      value: schoolId,
      type: TYPES.Int
    }
  ]
  return sqlService.query(sql, params)
}

/**
 * Get group document by _id.
 * @deprecated use sqlFindGroup
 * @param query
 * @returns {Promise<*>}
 */
groupDataService.getGroup = async function (query) {
  return Group.findOne(query).lean().exec()
}

/**
 * Get group by id.
 * @param groupId
 * @param schoolId
 * @returns {Promise<void>}
 */
groupDataService.sqlFindOneById = async (groupId, schoolId) => {
  const sql = `SELECT id, [name] 
    FROM ${sqlService.adminSchema}.[group]
    WHERE id=@groupId AND school_id=@schoolId`

  const params = [
    {
      name: 'groupId',
      value: groupId,
      type: TYPES.Int
    },
    {
      name: 'schoolId',
      value: schoolId,
      type: TYPES.Int
    }
  ]

  const result = await sqlService.query(sql, params)
  return R.head(result)
}

/**
 * Get group by name.
 * @param groupName
 * @param schoolId
 * @returns {Promise<void>}
 */
groupDataService.sqlFindOneByName = async (groupName, schoolId) => {
  const sql = `SELECT id, [name] 
    FROM ${sqlService.adminSchema}.[group]
    WHERE isDeleted=0
    AND school_id=@schoolId
    AND name=@groupName`

  const params = [
    {
      name: 'groupName',
      value: groupName,
      type: TYPES.NVarChar
    },
    {
      name: 'schoolId',
      value: schoolId,
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
 * Update group.
 * @param id
 * @param name
 * @param schoolId
 * @returns {Promise}
 */
groupDataService.sqlUpdate = async (id, name, schoolId) => {
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
      name: 'schoolId',
      value: schoolId,
      type: TYPES.Int
    }
  ]
  return sqlService.modify(
    `UPDATE ${sqlService.adminSchema}.[group] 
    SET name=@name 
    WHERE [id]=@id AND school_id=@schoolId`,
    params)
}

/**
 * Update pupils assigned to group.
 * @param groupId
 * @param pupilIds
 * @returns {Promise<boolean>}
 */
groupDataService.sqlAssignPupilsToGroup = async (groupId, pupilIds) => {
  if (pupilIds.length < 1) {
    return false
  }
  const params = [
    {
      name: 'groupId',
      value: groupId,
      type: TYPES.Int
    }
  ]
  const insertSql = []
  const pupilIdValues = Object.values(pupilIds)
  for (let index = 0; index < pupilIdValues.length; index++) {
    const pupilId = pupilIdValues[index]
    insertSql.push(`(@pg${index},@pp${index})`)
    params.push({
      name: `pg${index}`,
      value: groupId,
      type: TYPES.Int
    })
    params.push({
      name: `pp${index}`,
      value: pupilId,
      type: TYPES.Int
    })
  }

  const sql = `
    DELETE ${sqlService.adminSchema}.[pupilGroup] WHERE group_id=@groupId;
    INSERT ${sqlService.adminSchema}.[pupilGroup] (group_id, pupil_id)
    VALUES ${insertSql.join(',')};`
  return sqlService.modifyWithTransaction(sql, params)
}

/**
 * Get pupils filtered by schoolId and/or groupId.
 * and grouped by group_id.
 * @param schoolId
 * @param groupId
 * @returns {Promise<*>}
 */
groupDataService.sqlFindPupils = async (schoolId, groupId) => {
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
    AND (g.group_id IS NULL`

  if (groupId) {
    params.push({
      name: 'groupId',
      value: groupId,
      type: TYPES.Int
    })
    sql += ` OR g.group_id=@groupId`
  }

  sql += ') ORDER BY lastName ASC, foreName ASC'

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
  const sql = `DELETE ${sqlService.adminSchema}.[pupilGroup] WHERE group_id=@groupId;
  UPDATE ${sqlService.adminSchema}.[group] SET isDeleted=1 WHERE id=@groupId`
  return sqlService.modifyWithTransaction(sql, params)
}

/**
 * Find groups by ids and school id.
 * @param schoolId
 * @param pupilIds
 * @returns {Promise<*>}
 */
groupDataService.sqlFindGroupsByIds = async (schoolId, pupilIds) => {
  if (!schoolId || !pupilIds || pupilIds.length < 1) return false

  let ids = []
  pupilIds.map((p) => { ids.push(p.id) })

  let sqlInit = `SELECT DISTINCT p.group_id as id, g.name 
    FROM ${sqlService.adminSchema}.[pupilGroup] p 
    JOIN ${sqlService.adminSchema}.[group] g
      ON g.id = p.group_id `
  let { params, paramIdentifiers } = sqlService.buildParameterList(ids, TYPES.Int)

  params.push({
    name: 'schoolId',
    value: schoolId,
    type: TYPES.Int
  })

  const whereClause = `WHERE g.isDeleted = 0 AND school_id=@schoolId AND pupil_id IN (${paramIdentifiers.join(', ')})`
  const sql = [sqlInit, whereClause].join(' ')
  return sqlService.query(sql, params)
}

module.exports = groupDataService
