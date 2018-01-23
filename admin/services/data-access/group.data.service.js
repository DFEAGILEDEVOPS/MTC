'use strict'

const Group = require('../../models/group')
const groupDataService = {}
const sqlService = require('./sql.service')
const TYPES = require('tedious').TYPES
const R = require('ramda')

/**
 * Get groups filtered by query.
 * @deprecated use sqlFindGroups
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
 * @returns {Promise<void>}
 */
groupDataService.sqlFindGroup = async (groupId, schoolId) => {
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
 * @returns {Promise<void>}
 */
groupDataService.sqlFindGroupByName = async (groupName) => {
  const sql = `SELECT id, [name] 
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
  let sqlAppend = ''

  pupilIds.forEach(p => {
    if (p) { sqlAppend += `(${groupId}, ${p}), ` }
  })

  // 'sqlService.modify' doesn't seem to like @values as a param
  const sqlInsert = `INSERT INTO ${sqlService.adminSchema}.[pupilGroup] (group_id, pupil_id) VALUES ${sqlAppend.substr(0, sqlAppend.length - 2)}`

  await sqlService.modify(sqlInsert, [])
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
  const sql = `
  BEGIN TRY
  BEGIN TRANSACTION GroupAndPupilPurge
    DELETE ${sqlService.adminSchema}.[pupilGroup] WHERE group_id=@groupId
    UPDATE ${sqlService.adminSchema}.[group] SET isDeleted=1 WHERE id=@groupId
 COMMIT TRANSACTION GroupAndPupilPurge
END TRY

BEGIN CATCH
  IF (@@TRANCOUNT > 0)
   BEGIN
      ROLLBACK TRANSACTION GroupAndPupilPurge
      PRINT 'Error detected, all changes reversed'
   END
  DECLARE @ErrorMessage NVARCHAR(4000);
    DECLARE @ErrorSeverity INT;
    DECLARE @ErrorState INT;

    SELECT @ErrorMessage = ERROR_MESSAGE(),
           @ErrorSeverity = ERROR_SEVERITY(),
           @ErrorState = ERROR_STATE();

    -- Use RAISERROR inside the CATCH block to return
    -- error information about the original error that
    -- caused execution to jump to the CATCH block.
    RAISERROR (@ErrorMessage, -- Message text.
               @ErrorSeverity, -- Severity.
               @ErrorState -- State.
               );
END CATCH
  `
  return sqlService.modify(sql, params)
}

module.exports = groupDataService
