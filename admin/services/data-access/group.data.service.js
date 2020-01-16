'use strict'

const groupDataService = {}
const sqlService = require('./sql.service')
const { TYPES } = require('./sql.service')
const R = require('ramda')
const redisCacheService = require('./redis-cache.service')

/**
 * Get active groups (non-soft-deleted).
 * @param schoolId
 * @returns {Promise<*>}
 */
groupDataService.sqlFindGroups = async (schoolId) => {
  const sql = `
  SELECT g.id, g.name, COUNT(p.id) as pupilCount
  FROM [mtc_admin].[group] g
  LEFT OUTER JOIN [mtc_admin].[pupil] p
  ON g.id = p.group_id
  WHERE g.school_id=@schoolId
  GROUP BY g.id, g.name
  ORDER BY name ASC`
  const params = [
    {
      name: 'schoolId',
      value: schoolId,
      type: TYPES.Int
    }
  ]
  return sqlService.readonlyQuery(sql, params, `group.sqlFindGroups.${schoolId}`)
}

/**
 * Get active groups (non-soft-deleted), which have at least one present pupil who haven't been allocated a check.
 * @param schoolId
 * @returns {Promise<*>}
 */
groupDataService.sqlFindGroupsWithAtleastOnePresentPupil = async (schoolId) => {
  const sql = `
      SELECT g.id,
             g.name,
             COUNT(p.id) as pupilCount
      FROM [mtc_admin].[group] g
               LEFT JOIN [mtc_admin].pupil p ON (g.id = p.group_id)
      WHERE p.attendanceId IS NULL
        AND g.school_id = @schoolId
        AND p.currentCheckId IS NULL
      GROUP BY g.id, g.name
      ORDER BY name ASC`
  const params = [
    {
      name: 'schoolId',
      value: schoolId,
      type: TYPES.Int
    }
  ]
  return sqlService.readonlyQuery(sql, params)
}

/**
 * Get group by id.
 * @param groupId
 * @param schoolId
 * @returns {Promise<object>}
 */
groupDataService.sqlFindOneById = async (groupId, schoolId) => {
  const sql = `SELECT id, [name]
    FROM [mtc_admin].[group]
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

  const result = await sqlService.readonlyQuery(sql, params)
  return R.head(result)
}

/**
 * Get group by name.
 * @param groupName
 * @param schoolId
 * @returns {Promise<object>}
 */
groupDataService.sqlFindOneByName = async (groupName, schoolId) => {
  const sql = `SELECT id, [name]
    FROM [mtc_admin].[group]
    WHERE school_id=@schoolId
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

  const result = await sqlService.readonlyQuery(sql, params)
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
  UPDATE [mtc_admin].[group]
  SET name=@name
  WHERE [id]=@id AND school_id=@schoolId
  `

  await sqlService.modify(sql, params)
  return redisCacheService.drop(`group.sqlFindGroups.${schoolId}`)
}

/**
 * Update pupils assigned to group.
 * @param groupId
 * @param pupilIds
 * @returns {Promise<boolean>}
 */
groupDataService.sqlModifyGroupMembers = async (groupId, pupilIds) => {
  if (pupilIds.length < 1) {
    return false
  }
  const groupIdParam =
    {
      name: 'groupId',
      value: groupId,
      type: TYPES.Int
    }
  const pupilIdValues = Object.values(pupilIds)
  const { params, paramIdentifiers } = sqlService.buildParameterList(pupilIdValues, TYPES.Int)
  const whereClause = 'WHERE id IN (' + paramIdentifiers.join(', ') + ')'
  params.push(groupIdParam)

  // reset group members to none, then re-apply set
  let sql = `UPDATE mtc_admin.pupil SET group_id = NULL WHERE group_id = @groupId;
     UPDATE mtc_admin.pupil SET group_id = @groupId ${whereClause};`
  const modifyResult = await sqlService.modifyWithTransaction(sql, params)

  sql = 'SELECT school_id FROM [mtc_admin].[group] WHERE id=@groupId'
  const groups = await sqlService.query(sql, params)
  if (!groups || groups.length === 0) {
    return modifyResult
  }
  await redisCacheService.drop(`group.sqlFindGroups.${groups[0].school_id}`)
  return modifyResult
}

/**
 * Get pupils filtered by schoolId and/or groupId.
 * Returns all pupils in a particular school with either no grouping or a particular group.
 * @param schoolId
 * @param groupId
 * @returns {Promise<*>}
 */
groupDataService.sqlFindPupilsInNoGroupOrSpecificGroup = async (schoolId, groupId) => {
  /*
  The name of this function was 'sqlFindPupils'. Rather ambigious and is trying to do too many things.
  It is only used in one place - groupService.getPupils().
  The name has been updated to sqlFindPupilsInNoGroupOrSpecificGroup inline with its single purpose.
  */
  const params = [
    {
      name: 'schoolId',
      value: schoolId,
      type: TYPES.Int
    }
  ]
  let sql = `SELECT *
  FROM [mtc_admin].[pupil]
  WHERE school_id=@schoolId
  AND (group_id IS NULL`

  if (groupId) {
    params.push({
      name: 'groupId',
      value: groupId,
      type: TYPES.Int
    })
    sql += ' OR group_id=@groupId'
  }

  sql += ') ORDER BY group_id DESC, lastName ASC, foreName ASC, middleNames ASC, dateOfBirth ASC'

  return sqlService.readonlyQuery(sql, params)
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

  let sql = 'SELECT school_id FROM [mtc_admin].[group] WHERE id=@groupId'
  const groups = await sqlService.query(sql, params)

  sql = `UPDATE [mtc_admin].[pupil] SET group_id=NULL WHERE group_id=@groupId;
  DELETE [mtc_admin].[group] WHERE id=@groupId`

  const modifyResult = await sqlService.modifyWithTransaction(sql, params)
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

  const pupilIdentifiers = pupilIds.map(p => p.id)

  const sqlInit = `SELECT DISTINCT p.group_id as id, g.name
    FROM [mtc_admin].[pupil] p
    INNER JOIN [mtc_admin].[group] g
      ON g.id = p.group_id `
  const { params, paramIdentifiers } = sqlService.buildParameterList(pupilIdentifiers, TYPES.Int)

  params.push({
    name: 'schoolId',
    value: schoolId,
    type: TYPES.Int
  })

  const whereClause = `WHERE g.school_id=@schoolId AND p.id IN (${paramIdentifiers.join(', ')}) ORDER BY g.name ASC`
  const sql = [sqlInit, whereClause].join(' ')
  return sqlService.readonlyQuery(sql, params)
}

/**
 * Find group by pupil id
 * @param pupilId
 * @return {Promise<Object>}
 */
groupDataService.sqlFindOneGroupByPupilId = async (pupilId) => {
  if (!pupilId) return false

  const sql = `SELECT * FROM mtc_admin.[group] g
  INNER JOIN mtc_admin.pupil p ON g.id = p.group_id
  WHERE p.id = @pupilId`

  const params = [
    {
      name: 'pupilId',
      value: pupilId,
      type: TYPES.Int
    }
  ]

  const result = await sqlService.readonlyQuery(sql, params)
  return R.head(result)
}

module.exports = groupDataService
