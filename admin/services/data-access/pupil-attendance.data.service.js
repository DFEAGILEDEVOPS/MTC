'use strict'

const { TYPES } = require('./sql.service')
const sqlService = require('./sql.service')
const R = require('ramda')
const logger = require('../log.service').getLogger()

const table = '[pupilAttendance]'
const pupilAttendanceDataService = {}

pupilAttendanceDataService.sqlInsertBatch = async (ids, attendanceCodeId, userId) => {
  logger.debug('pupilAttendanceDataService.sqlInsertBatch: called')
  const insert = `INSERT INTO ${sqlService.adminSchema}.${table} (
     pupil_id,
     recordedBy_user_id,
     attendanceCode_id
   ) VALUES `

  const insertsClauses = []
  const params = []
  params.push({ name: 'userId', type: TYPES.Int, value: userId })
  params.push({ name: 'attendanceCode', type: TYPES.Int, value: attendanceCodeId })

  for (let i = 0; i < ids.length; i++) {
    insertsClauses.push(`(@p${i}, @userId, @attendanceCode)`)
    params.push({ name: `p${i}`, type: TYPES.Int, value: ids[i] })
  }

  const valuesSql = insertsClauses.join(', ')
  const sql = [insert, valuesSql].join(' ')
  return sqlService.modify(sql, params)
}

pupilAttendanceDataService.sqlUpdateBatch = async (pupilIds, attendanceCodeId, userId) => {
  const update = `UPDATE ${sqlService.adminSchema}.${table}
    SET
      attendanceCode_id = @attendanceCodeId,
      recordedBy_user_id = @userId
  `

  const params = [
    { name: 'attendanceCodeId', type: TYPES.Int, value: attendanceCodeId },
    { name: 'userId', type: TYPES.Int, value: userId }
  ]

  const where = sqlService.buildParameterList(pupilIds, TYPES.Int)
  const whereClause = 'WHERE pupil_id IN (' + where.paramIdentifiers.join(', ') + ')'
  const sql = [update, whereClause].join(' ')
  return sqlService.modify(sql, R.concat(params, where.params))
}

pupilAttendanceDataService.sqlDeleteOneByPupilId = async (pupilId) => {
  if (!pupilId) {
    throw new Error('pupilId is required for a DELETE')
  }
  const sql = `
  UPDATE ${sqlService.adminSchema}.${table}
  SET isDeleted=1
  WHERE pupil_id = @pupilId`
  const param = { name: 'pupilId', value: pupilId, type: TYPES.Int }
  return sqlService.modify(sql, [param])
}

pupilAttendanceDataService.findByPupilIds = async (ids) => {
  const select = `
  SELECT *
  FROM ${sqlService.adminSchema}.${table}
  `
  const { params, paramIdentifiers } = sqlService.buildParameterList(ids, TYPES.Int)
  const whereClause = 'WHERE pupil_id IN (' + paramIdentifiers.join(', ') + ') AND isDeleted=0'
  const sql = [select, whereClause].join(' ')
  return sqlService.query(sql, params)
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
  const result = await sqlService.query(sql, params)
  return R.head(result)
}

/**
 * Does everything in the database to mark a pupil as not attending
 * @param {String[]} slugs - pupil.urlSlug
 * @param {String} code - 5 letter attendanceCode.code
 * @param {Number} userId
 * @param {Number} schoolId
 * @return {Promise<*>}
 */
pupilAttendanceDataService.markAsNotAttending = async (slugs, code, userId, schoolId) => {
  console.log(`Got code ${code}`)
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
  
  DECLARE @attendanceCode_id Int = (SELECT id from [mtc_admin].[attendanceCode] where code = @code);
  
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
  
  -- Validation: pupils cannot have a current check assigned
  IF (SELECT COUNT(*) FROM [mtc_admin].[pupil] p
      JOIN #pupilsToSet t1 ON (p.id = t1.id)
      WHERE currentCheckId IS NOT NULL) > 0
      THROW 51000, 'One or more pupils is not eligible to have their attendanceId set', 1;
  
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
      checkComplete = 0
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
    pr.deletedByUser_id = @userId
  FROM
       [mtc_admin].[pupil] p JOIN
       #pupilsToSet t1 ON (p.id = t1.id) LEFT JOIN
       [mtc_admin].[pupilRestart] pr ON (p.id = pr.pupil_id)
  WHERE
      pr.isDeleted  = 0
  AND pr.check_id IS NULL -- unconsumed
  ;`

  return sqlService.modifyWithTransaction(sql, params.concat(insertParams))
}

module.exports = pupilAttendanceDataService
