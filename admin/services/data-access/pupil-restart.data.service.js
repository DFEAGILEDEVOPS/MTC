'use strict'
const { TYPES } = require('./sql.service')
const R = require('ramda')
const sqlService = require('./sql.service')

const pupilRestartDataService = {}

/** SQL METHODS **/

/**
 * Returns number of restarts specified by pupil id
 * @param pupilId
 * @return {Promise.<*>}
 */
pupilRestartDataService.sqlGetNumberOfRestartsByPupil = async function (pupilId) {
  const sql = `SELECT COUNT(*) AS [cnt]
  FROM ${sqlService.adminSchema}.[pupilRestart]
  WHERE pupil_id=@pupilId AND isDeleted=0
  AND DATEDIFF(day, createdAt, GETUTCDATE()) = 0`
  const params = [
    {
      name: 'pupilId',
      value: pupilId,
      type: TYPES.Int
    }
  ]
  const result = await sqlService.query(sql, params)
  const obj = R.head(result)
  return R.prop('cnt', obj)
}

/**
 * Find latest restart for pupil
 * @param pupilId
 * @return {Promise.<object>}
 */
pupilRestartDataService.sqlFindLatestRestart = async function (pupilId) {
  const sql = `SELECT TOP 1 *
  FROM ${sqlService.adminSchema}.[pupilRestart]
  WHERE pupil_id=@pupilId AND isDeleted=0
  ORDER BY createdAt DESC`
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

/**
 * Find pupil's restart codes
 * @return {Promise.<void>}
 */
pupilRestartDataService.sqlFindRestartCodes = async function () {
  const sql = `
  SELECT
    id,
    code,
    description
  FROM ${sqlService.adminSchema}.[pupilRestartCode]
  ORDER BY description ASC`
  return sqlService.query(sql)
}

/**
 * Find pupil's restart reason description by id
 * @param id
 * @return {Promise.<string>}
 */
pupilRestartDataService.sqlFindRestartReasonDescById = async function (id) {
  const sql = `
  SELECT
    description
  FROM ${sqlService.adminSchema}.[pupilRestartReason]
  WHERE id=@id
  ORDER BY description ASC`
  const params = [
    {
      name: 'id',
      value: id,
      type: TYPES.Int
    }
  ]
  const result = await sqlService.query(sql, params)
  const obj = R.head(result)
  return R.prop('description', obj)
}

/**
 * Find restart reasons
 * @return {Promise.<void>}
 */
pupilRestartDataService.sqlFindRestartReasons = async function () {
  const sql = `
  SELECT
    id,
    code,
    description
  FROM ${sqlService.adminSchema}.[pupilRestartReason]
  ORDER BY displayOrder ASC`
  return sqlService.query(sql)
}

/**
 * Mark an existing pupil restart as deleted
 * @param restartId
 * @param userId
 * @return {Promise<*>}
 */
pupilRestartDataService.sqlMarkRestartAsDeleted = async (restartId, userId) => {
  const params = [
    {
      name: 'restartId',
      value: restartId,
      type: TYPES.Int
    },
    {
      name: 'userId',
      value: userId,
      type: TYPES.Int
    }
  ]
  const sql = `DECLARE @newCheckId int; 
               DECLARE @parentCheckId int;
               DECLARE @pupilId int;
               DECLARE @isDeleted bit;
               DECLARE @parentCheckCode char(3);
               
               SELECT
                 @newCheckId = check_id,
                 @pupilId = pupil_id,
                 @isDeleted = isDeleted,
                 @parentCheckId = parentCheckId
               FROM 
                [mtc_admin].[pupilRestart] 
               WHERE id = @restartId;
               
               -- Just check that the restart has not already been deleted
               IF @isDeleted = 1
                THROW 51000, 'Restart already deleted', 1;
              
               -- Soft-delete the restart record
               UPDATE [mtc_admin].[pupilRestart]
               SET isDeleted=1, deletedByUser_id=@userId
               WHERE id = @restartId;
               
               -- IF there is new check raised that has a NEW status, we must VOID the check                              
               IF (@newCheckId IS NOT NULL)
               BEGIN
                  UPDATE [mtc_admin].[check] 
                  SET checkStatus_id = (select id from [mtc_admin].[checkStatus] where code = 'VOD')
                  WHERE id = @newCheckId;
                  
                  -- delete check pin as it will never be used
                  DELETE FROM [mtc_admin].[checkPin] where check_id = @newCheckId;
               END
               
               -- The previous check will have been VOIDED, and it must be re-activated.
               UPDATE [mtc_admin].[check]
               SET checkStatus_id = dbo.ufnCalcCheckStatusID(@parentCheckId)
               WHERE id = @parentCheckId;
               
               -- Get the parent check status code
               SELECT 
                @parentCheckCode = code 
               FROM [mtc_admin].[check] c JOIN 
                    [mtc_admin].[checkStatus] cs ON (c.checkStatus_id = cs.id)
               WHERE 
                    c.id = @parentCheckId;
               
               -- Update pupil state fields
               UPDATE [mtc_admin].[pupil] 
               SET currentCheckId = @parentCheckId,
                   restartAvailable = 0,
                   checkComplete = IIF (@parentCheckCode = 'CMP', 1, 0)
               WHERE
                   id = @pupilId;                     
               `
  return sqlService.modifyWithTransaction(sql, params)
}

/**
 * Find latest open restarts by pupil slug and, for security, schoolId
 * @param pupilUrlSlug
 * @param schoolId
 * @return {Promise<object>}
 */
pupilRestartDataService.sqlFindOpenRestartForPupil = async (pupilUrlSlug, schoolId) => {
  const sql = `SELECT TOP (1) pr.*
               FROM [mtc_admin].[pupilRestart] pr JOIN
                    [mtc_admin].[pupil] p ON (pr.pupil_id = p.id)
               WHERE isDeleted = 0
               AND p.urlSlug = @pupilUrlSlug
               AND p.school_id = @schoolId
               ORDER BY pr.createdAt DESC`

  const params = [
    { name: 'pupilUrlSlug', value: pupilUrlSlug, type: TYPES.UniqueIdentifier },
    { name: 'schoolId', value: schoolId, type: TYPES.Int }
  ]

  const restarts = await sqlService.query(sql, params)

  return R.head(restarts)
}

/**
 * Find a check by id
 * @param checkId
 * @param schoolId
 * @return {Promise<Object>}
 */
pupilRestartDataService.sqlFindCheckById = async function (checkId, schoolId) {
  const sql = `SELECT
                chk.*,
                cs.code
               FROM [mtc_admin].[check] chk join
                    [mtc_admin].[pupil] p ON (chk.pupil_id = p.id) join
                    [mtc_admin].[checkStatus] cs ON (chk.checkStatus_id = cs.id)
               WHERE
                    chk.id = @checkId
               AND p.school_id = @schoolId`

  const params = [
    { name: 'checkId', value: checkId, type: TYPES.Int },
    { name: 'schoolId', value: schoolId, type: TYPES.Int }
  ]

  const check = await sqlService.query(sql, params)
  return R.head(check)
}

module.exports = pupilRestartDataService
