'use strict'

const { TYPES } = require('./sql.service')
const sqlService = require('./sql.service')
const R = require('ramda')
const RA = require('ramda-adjunct')
const logger = require('../log.service').getLogger()

const table = '[pupilAttendance]'
const logName = 'pupilAttendanceDataService'
const pupilAttendanceDataService = {}

pupilAttendanceDataService.sqlUpdateBatch = async (pupilIds, attendanceCodeId, userId) => {
  const where = sqlService.buildParameterList(pupilIds, TYPES.Int)
  const update = `
    UPDATE [mtc_admin].[pupilAttendance]
    SET
      attendanceCode_id = @attendanceCodeId,
      recordedBy_user_id = @userId
    WHERE
        pupil_id IN (${where.paramIdentifiers.join(', ')});

    UPDATE [mtc_admin].[pupil]
    SET
        attendanceId = @attendanceCodeId,
        lastModifiedBy_userId = @userId
    WHERE
        id IN (${where.paramIdentifiers.join(', ')});
  `
  const params = [
    { name: 'attendanceCodeId', type: TYPES.Int, value: attendanceCodeId },
    { name: 'userId', type: TYPES.Int, value: userId }
  ]
  return sqlService.modifyWithTransaction(update, R.concat(params, where.params))
}

pupilAttendanceDataService.sqlDeleteOneByPupilId = async function sqlDeleteOneByPupilId (pupilId, userId, role) {
  if (!pupilId) {
    throw new Error('pupilId is required for a DELETE')
  }

  if (!userId) {
    throw new Error('userId is required for a DELETE')
  }

  if (!role) {
    throw new Error('role is required for a DELETE')
  }

  // Permission guard - you can only delete permissions you are allowed to set via the Role.
  const pupil = await this.findOneByPupilId(pupilId)
  await this.throwIfAttendanceCodeIsForbidden(pupil.code, role)

  const sql = `
  --
  -- capture the pupilAttendanceId for the restart undo
  --
  DECLARE @pupilAttendanceTable TABLE (ID INT NULL);
  DECLARE @pupilAttendanceId INT;
  --
  -- Remove the attendance code
  --
  UPDATE [mtc_admin].[pupilAttendance]
  SET isDeleted=1
  OUTPUT INSERTED.ID INTO @pupilAttendanceTable
  WHERE pupil_id = @pupilId;
  --
  -- Get the pupilAttendanceId
  SELECT @pupilAttendanceId = ID FROM @pupilAttendanceTable;
  --
  -- Maintain the pupil state
  --
  UPDATE [mtc_admin].[pupil]
  SET attendanceId = NULL,
  lastModifiedBy_userId = @userId
  WHERE id = @pupilId;

  UPDATE [mtc_admin].[pupilRestart]
  SET isDeleted = 0,
  deletedByUser_id = NULL,
  deletedAt = NULL,
  deletedBy_pupilAttendance_id = NULL
  WHERE
  deletedBy_pupilAttendance_id = @pupilAttendanceId
  AND isDeleted = 1
  AND pupil_id = @pupilId;
  `
  const params = [
    {
      name: 'pupilId',
      value: pupilId,
      type: TYPES.Int
    },
    {
      name: 'userId',
      type: TYPES.Int,
      value: userId
    }]
  return sqlService.modifyWithTransaction(sql, params)
}

/**
 * Returns pupil attendance based on pupil id
 * @param pupilId
 * @return {Promise<Object>}
 */
pupilAttendanceDataService.findOneByPupilId = async (pupilId) => {
  const select = `
  SELECT p.*, a.code
  FROM ${sqlService.adminSchema}.${table} p
  INNER JOIN ${sqlService.adminSchema}.[attendanceCode] a
  ON p.attendanceCode_id = a.id
  `
  const params = [
    {
      name: 'pupilId',
      value: pupilId,
      type: TYPES.Int
    }
  ]
  const whereClause = 'WHERE pupil_id=@pupilId AND isDeleted=0'
  const sql = [select, whereClause].join(' ')
  const result = await sqlService.readonlyQuery(sql, params)
  return R.head(result)
}

/**
 * Does everything in the database to mark a pupil as not attending
 * @param {String[]} slugs - pupil.urlSlug
 * @param {String} code - 5 letter attendanceCode.code
 * @param {Number} userId
 * @param {Number} schoolId
 * @param {String} role
 * @return {Promise<*>}
 */
pupilAttendanceDataService.markAsNotAttending = async function markAsNotAttending (slugs, code, userId, schoolId, role) {
  logger.debug(`pupilAttendanceDataService.markAsNotAttending called with code ${code}`)
  if (!Array.isArray(slugs)) {
    throw new Error('slugs is not an array')
  }

  if (slugs.length === 0) {
    throw new Error('Slugs param is empty')
  }

  if (!userId) {
    throw new Error('userId param is missing')
  }

  if (!schoolId) {
    throw new Error('schoolId param is missing')
  }

  if (!code) {
    throw new Error('code param is missing')
  }

  if (!RA.isNonEmptyString(role)) {
    throw new Error('role param is missing')
  }

  // Check this role has permission to use this code.
  await this.throwIfAttendanceCodeIsForbidden(code, role)

  const insertSql = slugs.map((s, idx) =>
    `INSERT into #pupilsToSet (slug, school_id, attendanceCode_id, recordedBy_user_id)
    VALUES (@slug${idx}, @school_id, @attendanceCode_Id, @userId);`)

  const { params: insertParams } = sqlService.buildParameterList(slugs, TYPES.NVarChar, 'slug')
  const params = [
    { name: 'school_id', type: TYPES.Int, value: schoolId },
    { name: 'userId', type: TYPES.Int, value: userId },
    { name: 'code', type: TYPES.Char(5), value: code }
  ]

  const sql = `
  --
  -- Mark pupils as not attending
  --

  DECLARE @attendanceCode_id Int = (SELECT id from [mtc_admin].[attendanceCode] where code = @code AND visible = 1);

  IF @attendanceCode_id IS NULL
    THROW 51000, 'unknown attendanceCode.code', 1;

  -- Temp table to hold the incoming data
  CREATE TABLE #pupilsToSet (
      slug        nvarchar(100) NOT NULL,
      id          int,
      school_id   int NOT NULL,
      recordedBy_user_id int NOT NULL,
      attendanceCode_id int NOT NULL
  );

  -- Populate the main temp table
  ${insertSql.join('\n')}

  -- Check the slugs match genuine pupils
  -- Populate the temp table with pupil ids: slugs that are invalid will not get their id populated.
  UPDATE #pupilsToSet
  SET id = (select id from mtc_admin.pupil where urlSlug = slug);

  -- Bail out if a pupil is not found
  IF (SELECT COUNT(*) FROM #pupilsToSet WHERE id IS NULL) > 0
      THROW 51000, 'pupil urlSlug not found', 1;

  -- Commented out 14-APR-21: this can be restored once the performance ticket 46465 is played.
  -- Otherwise, delete or update this check to allow expired pins
  -- Validation: pupils cannot have a current check assigned
  -- IF (SELECT COUNT(*) FROM [mtc_admin].[pupil] p
  --    JOIN #pupilsToSet t1 ON (p.id = t1.id)
  --    WHERE currentCheckId IS NOT NULL) > 0
  --    THROW 51000, 'One or more pupils is not eligible to have their attendanceId set', 1;

  -- Add the pupil attendance records: can be inserts or updates
  MERGE [mtc_admin].[pupilAttendance] target USING #pupilsToSet as source
  ON source.id = target.pupil_id AND target.isDeleted = 0
  WHEN MATCHED
      THEN UPDATE
           SET
               target.attendanceCode_id = source.attendanceCode_id,
               target.recordedBy_user_id = source.recordedBy_user_id
  WHEN NOT MATCHED BY TARGET THEN
      INSERT (pupil_id, attendanceCode_id, recordedBy_user_id)
      VALUES (source.id, source.attendanceCode_id, source.recordedBy_user_id)
  ;

  -- Modify the pupil state
  UPDATE [mtc_admin].[pupil]
  SET
      attendanceId = t1.attendanceCode_id,
      restartAvailable = 0,
      checkComplete = 0,
      lastModifiedBy_userId = t1.recordedBy_user_id
  FROM
      [mtc_admin].[pupil] p JOIN
      #pupilsToSet t1 ON (p.id = t1.id)
  WHERE
      p.id = t1.id
  ;

  -- Delete any *unconsumed* restarts
  UPDATE pr
  SET
    pr.isDeleted = 1,
    pr.deletedByUser_id = @userId,
    pr.deletedAt = GETUTCDATE(),
    pr.deletedBy_pupilAttendance_id = pa.id
  FROM
       [mtc_admin].[pupil] p
       JOIN #pupilsToSet t1 ON (p.id = t1.id)
       LEFT JOIN [mtc_admin].[pupilRestart] pr ON (p.id = pr.pupil_id)
       LEFT JOIN [mtc_admin].[pupilAttendance] pa ON (p.id = pa.pupil_id)
  WHERE
      pr.isDeleted = 0
  AND pr.check_id IS NULL
  AND pa.isDeleted = 0
  -- unconsumed restarts & current attendance record
  ;`

  return sqlService.modifyWithTransaction(sql, params.concat(insertParams))
}

/**
 * Return an array of attendance codes for a particular role (TEACHER, SERVICE-MANAGER etc)
 * @param {string} role - TEACHER, HELPDESK, SERVICE_MANAGER ...
 * @returns string[] - array of attendance codes
 */
pupilAttendanceDataService.getAttendanceCodes = async function getAttendanceCodes (role) {
  logger.info(`${logName}: getAttendanceCodes(): called with role [${role}]`)
  const sql = `
    SELECT
      *
    FROM
      [mtc_admin].[vewAttendanceCodePermissions]
    WHERE
      roleTitle = @role
    ORDER BY
      [attendanceCodeDisplayOrder] ASC
  `
  const params = [
    { name: 'role', type: TYPES.NVarChar, value: role }
  ]
  const data = await sqlService.readonlyQuery(sql, params)
  const allowedCodes = data.map(d => d.attendanceCode)
  logger.info(`${logName}: getAttendanceCodes() returning ${JSON.stringify(allowedCodes)}`)
  return allowedCodes
}

/**
 * Throws an error id an attendance code is not allowed for a role
 * @param {string} code
 * @param {string} role
 * @returns
 */
pupilAttendanceDataService.throwIfAttendanceCodeIsForbidden = async function throwIfAttendanceCodeIsForbidden (code, role) {
  const allowedCodes = await this.getAttendanceCodes(role)
  if (allowedCodes.includes(code)) {
    return
  }
  const msg = `Attendance code [${code}] is not allowed for role [${role}]`
  throw new Error(msg)
}

module.exports = pupilAttendanceDataService
