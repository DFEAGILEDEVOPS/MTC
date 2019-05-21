'use strict'

const groupDataService = {}
const sqlService = require('./sql.service')
const { TYPES } = require('./sql.service')
const R = require('ramda')
const redisCacheService = require('../redis-cache.service')
const logger = require('../log.service').getLogger()
const config = require('../../config')
const { REDIS_CACHING } = config

/**
 * Get active groups (non-soft-deleted).
 * @param schoolId
 * @returns {Promise<*>}
 */
groupDataService.sqlFindGroups = async (schoolId) => {
  const sql = `
  SELECT g.id, g.name, COUNT(pg.pupil_id) as pupilCount 
  FROM ${sqlService.adminSchema}.[group] g
  LEFT OUTER JOIN ${sqlService.adminSchema}.[pupilGroup] pg 
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
  return sqlService.query(sql, params, `group.sqlFindGroups.${schoolId}`)
}

/**
 * Get active groups (non-soft-deleted), which have at least one present pupil.
 * @param schoolId
 * @returns {Promise<*>}
 */
groupDataService.sqlFindGroupsWithAtleastOnePresentPupil = async (schoolId) => {
  const sql = `
  SELECT g.id, g.name, COUNT(pg.pupil_id) as pupilCount 
  FROM ${sqlService.adminSchema}.[group] g
  LEFT OUTER JOIN ${sqlService.adminSchema}.pupilGroup pg 
  ON g.id = pg.group_id
  LEFT JOIN ${sqlService.adminSchema}.pupilAttendance pa
  ON pa.pupil_id=pg.pupil_id AND pa.isDeleted=0
  WHERE pa.id IS NULL
  AND g.isDeleted=0
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
 * Create 'group' record.
 * @param group
 * @returns {Promise}
 */
groupDataService.sqlCreate = (group) => {
  return sqlService.create('[group]', group)
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
  const sql = `
  UPDATE ${sqlService.adminSchema}.[group] 
  SET name=@name 
  WHERE [id]=@id AND school_id=@schoolId
  `
  const changes = { table: 'group', update: { [id]: { name } } }
  try {
    const redisUpdate = await redisCacheService.update(`group.sqlFindGroups.${schoolId}`, changes)
    if (!redisUpdate) {
      await sqlService.modify(sql, params)
      return redisCacheService.drop(`group.sqlFindGroups.${schoolId}`)
    }
    return true
  } catch (e) {
    logger.error('groupDataService.sqlUpdate: Error executing redisCacheService.update', e)
    throw e
  }
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

  let sql = `
    DELETE ${sqlService.adminSchema}.[pupilGroup] WHERE group_id=@groupId;
    INSERT ${sqlService.adminSchema}.[pupilGroup] (group_id, pupil_id)
    VALUES ${insertSql.join(',')};`
  const modifyResult = await sqlService.modifyWithTransaction(sql, params)
  if (!REDIS_CACHING) {
    return modifyResult
  }
  sql = `SELECT school_id FROM ${sqlService.adminSchema}.[group] WHERE id=@groupId`
  const groups = await sqlService.query(sql, params)
  if (!groups || groups.length === 0) {
    return modifyResult
  }
  await redisCacheService.drop(`group.sqlFindGroups.${groups[0].school_id}`)
  return modifyResult
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

  let sql = `SELECT p.*, g.[group_id]
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

  sql += ') ORDER BY group_id DESC, lastName ASC, foreName ASC, middleNames ASC, dateOfBirth ASC'

  return sqlService.query(sql, params)
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
  let sql = `DELETE ${sqlService.adminSchema}.[pupilGroup] WHERE group_id=@groupId;
  UPDATE ${sqlService.adminSchema}.[group] SET isDeleted=1 WHERE id=@groupId`
  const modifyResult = await sqlService.modifyWithTransaction(sql, params)
  if (!REDIS_CACHING) {
    return modifyResult
  }
  sql = `SELECT school_id FROM ${sqlService.adminSchema}.[group] WHERE id=@groupId`
  const groups = await sqlService.query(sql, params)
  if (!groups || groups.length === 0) {
    return modifyResult
  }
  await redisCacheService.drop(`group.sqlFindGroups.${groups[0].school_id}`)
  return modifyResult
}

/**
 * Find groups by ids and school id.
 * @param schoolId
 * @param pupilIds
 * @returns {Promise<*>}
 */
groupDataService.sqlFindGroupsByIds = async (schoolId, pupilIds) => {
  if (!schoolId || !pupilIds || pupilIds.length < 1) return false

  const ids = pupilIds.map(p => p.id)

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

  const whereClause = `WHERE g.isDeleted = 0 AND school_id=@schoolId AND pupil_id IN (${paramIdentifiers.join(', ')}) ORDER BY g.name ASC`
  const sql = [sqlInit, whereClause].join(' ')
  return sqlService.query(sql, params)
}

/**
 * Find group by pupil id
 * @param pupilId
 * @return {Object}
 */
groupDataService.sqlFindOneGroupByPupilId = async (pupilId) => {
  if (!pupilId) return false

  const sql = `SELECT * FROM mtc_admin.[group] g
  INNER JOIN mtc_admin.pupilGroup pg ON g.id = pg.group_id
  WHERE pg.pupil_id = @pupilId AND g.isDeleted = 0`

  const params = [
    {
      name: 'pupilId',
      value: pupilId,
      type: TYPES.Int
    }
  ]

  const result = await sqlService.query(sql, params)
  return R.head(result)
}

module.exports = groupDataService
