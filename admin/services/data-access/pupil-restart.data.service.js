'use strict'
const { TYPES } = require('./sql.service')
const R = require('ramda')
const sqlService = require('./sql.service')

const pupilRestartDataService = {}

/** SQL METHODS **/

/**
 * Find restart reasons
 * @return {Promise<any>}
 */
pupilRestartDataService.sqlFindRestartReasons = async function () {
  const sql = `
  SELECT
    id,
    code,
    description
  FROM [mtc_admin].[restartReasonLookup]
  ORDER BY displayOrder ASC`
  return sqlService.query(sql)
}

/**
 * Mark an existing pupil restart as deleted
 * This is called when a restart is deleted by a teacher.
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
  const sql = `DECLARE @newCheckPupilLoginDate DATETIMEOFFSET;
               DECLARE @newCheckReceived BIT;
               DECLARE @newCheckComplete BIT;
               DECLARE @originCheckId INT;
               DECLARE @originCheckComplete BIT;
               DECLARE @pupilId INT;
               DECLARE @isDeleted BIT;

               -- Populate the main variables
               SELECT
                 @pupilId = pupil_id,
                 @isDeleted = isDeleted,
                 @originCheckId = voidCheck_id
               FROM
                [mtc_admin].[pupilRestart]
               WHERE id = @restartId;

               -- Just check that the restart has not already been deleted
               IF @isDeleted = 1
                THROW 51000, 'Restart already deleted', 1;

               -- Soft-delete the restart record
               UPDATE [mtc_admin].[pupilRestart]
               SET isDeleted=1, deletedByUser_id=@userId, deletedAt=sysdatetimeoffset()
               WHERE id = @restartId;

               -- See if there is a new check raised against the restart to consume it
               IF (@newCheckId IS NOT NULL)
               BEGIN
                   -- a pin has been generated after the restart was created
                   -- Get the check status code
                   SELECT
                    @newCheckPupilLoginDate = c.pupilLoginDate,
                    @newCheckReceived = c.received,
                    @newCheckComplete = c.complete
                   FROM [mtc_admin].[check] c LEFT JOIN
                       [mtc_admin].[checkPin] cp ON (c.id = cp.check_id)
                   WHERE
                        c.id = @newCheckId;

                   -- IF the new check is not in NEW status we have to bail out
                   IF (@newCheckPupilLoginDate IS NOT NULL OR @newCheckReceived = 1 OR @newCheckComplete = 1)
                    THROW 51000, 'New check cannot be deleted as it does not have a NEW status', 1;

                  -- delete check pin as it will never be used
                  DELETE FROM [mtc_admin].[checkPin] where check_id = @newCheckId;
                  UPDATE [mtc_admin].[check] SET void = 0 WHERE id = @originCheckId;
               END

               -- Get the parent check complete flag, just so we can update the pupil.complete flag
               -- when we later update the pupil state fields.
               SELECT @originCheckComplete = complete
                 FROM [mtc_admin].[check] c
                WHERE c.id = @originCheckId;

               -- Update pupil state fields
               UPDATE [mtc_admin].[pupil]
               SET currentCheckId = @originCheckId,
                   restartAvailable = 0,
                   checkComplete = IIF (@originCheckComplete = 1, 1, 0),
                   lastModifiedBy_userId = @userId
               WHERE
                   id = @pupilId;
               `
  return sqlService.modifyWithTransactionAndResponse([sql], params)
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

module.exports = pupilRestartDataService
