'use strict'

const { TYPES } = require('./sql.service')
const R = require('ramda')
const sqlService = require('./sql.service')
const headteacherDeclarationDataService = {}

headteacherDeclarationDataService.sqlCreate = async function (data) {
  const sql = `
            DECLARE @hdfStatusLookup_id int
            SELECT @hdfStatusLookup_id = id FROM mtc_admin.hdfStatusLookup WHERE hdfStatusCode = @hdfStatusCode
            INSERT INTO mtc_admin.[hdf] (
              [signedDate]
              ,[jobTitle]
              ,[fullName]
              ,[school_id]
              ,[user_id]
              ,[checkWindow_id]
              ,[headTeacher]
              ,[hdfStatus_id]
              ,[noPupilsFurtherInfo])
            VALUES (
              @signedDate,
              @jobTitle,
              @fullName,
              @school_id,
              @user_id,
              @checkWindow_id,
              @headTeacher,
              @hdfStatusLookup_id,
              @noPupilsFurtherInfo)`
  const params = [
    {
      name: 'signedDate',
      value: data.signedDate,
      type: TYPES.DateTimeOffset
    },
    {
      name: 'jobTitle',
      value: data.jobTitle,
      type: TYPES.NVarChar
    },
    {
      name: 'fullName',
      value: data.fullName,
      type: TYPES.NVarChar
    },
    {
      name: 'school_id',
      value: data.school_id,
      type: TYPES.Int
    },
    {
      name: 'user_id',
      value: data.user_id,
      type: TYPES.Int
    },
    {
      name: 'checkWindow_id',
      value: data.checkWindow_id,
      type: TYPES.Int
    },
    {
      name: 'headTeacher',
      value: data.headTeacher,
      type: TYPES.Bit
    },
    {
      name: 'hdfStatusCode',
      value: data.hdfStatusCode,
      type: TYPES.Char
    },
    {
      name: 'noPupilsFurtherInfo',
      value: data.noPupilsFurtherInfo,
      type: TYPES.NVarChar(TYPES.MAX)
    }
  ]
  return sqlService.query(sql, params)
}

/**
 * Return the last HDF submitted for a school and the check end date
 * for the check window the HDF was submitted in
 * @param {number} schoolId
 * @return {Promise<object>}
 */
headteacherDeclarationDataService.sqlFindLatestHdfBySchoolId = async (schoolId, includeDeleted = false) => {
  let sql = `
  SELECT TOP 1
    h.fullName, h.headTeacher, h.jobTitle,
    hsl.hdfStatusCode, c.checkEndDate,
    h.signedDate, h.isDeleted
  FROM [mtc_admin].[hdf] h
  INNER JOIN mtc_admin.hdfStatusLookup hsl ON hsl.id = h.hdfStatus_id
  INNER JOIN mtc_admin.checkWindow c ON h.checkWindow_id = c.id
  WHERE h.school_id = @schoolId`
  if (!includeDeleted) {
    sql += ' AND h.isDeleted = 0'
  }
  sql += ' ORDER BY signedDate DESC'
  const paramSchoolId = { name: 'schoolId', type: TYPES.Int, value: schoolId }
  const rows = await sqlService.query(sql, [paramSchoolId])
  return R.head(rows)
}

/**
 * Find the HDF for a given check
 * @param schoolId
 * @param checkWindowId
 * @return {Promise<object|undefined>}
 */
headteacherDeclarationDataService.sqlFindHdfForCheck = async (schoolId, checkWindowId) => {
  const paramSchoolId = { name: 'schoolId', type: TYPES.Int, value: schoolId }
  const paramCheckWindow = { name: 'checkWindowId', type: TYPES.BigInt, value: checkWindowId }
  const sql = `
  SELECT TOP 1
    *
  FROM [mtc_admin].[hdf]
  WHERE checkWindow_id = @checkWindowId
  AND school_id = @schoolId
  AND isDeleted = 0`
  const result = await sqlService.query(sql, [paramCheckWindow, paramSchoolId])
  // This will only return a single result as an object
  return R.head(result)
}

/**
 * Find count of pupils blocking hdf submission before check end date
 * This finds a count of all pupils who are not marked as taking the check, but who haven't completed it yet.
 * @param schoolId
 * @return {Promise<Number>}
 */
headteacherDeclarationDataService.sqlFindPupilsBlockingHdf = async (schoolId) => {
  const sql = `
    SELECT COUNT(p.id) as pupilsCount
    FROM [mtc_admin].[pupil] p
    WHERE p.school_id = @schoolId
    AND (p.attendanceId IS NULL AND p.checkComplete <> 1)
  `

  const params = [
    { name: 'schoolId', type: TYPES.Int, value: schoolId }
  ]

  const result = await sqlService.query(sql, params)
  return R.path(['pupilsCount'], R.head(result))
}

/**
 * soft delete the hdf entry
 * @param schoolId
 * @param userId
 * @return {Promise<any>}
 */
headteacherDeclarationDataService.sqlSoftDeleteHdfEntry = async (schoolId, userId) => {
  const sql = `
    UPDATE [mtc_admin].[hdf]
    SET isDeleted = 1, deletedAt = GETUTCDATE(), deletedBy_userId = @userId
    WHERE school_id = @schoolId
  `

  const params = [
    { name: 'schoolId', type: TYPES.Int, value: schoolId },
    { name: 'userId', type: TYPES.Int, value: userId }
  ]
  return sqlService.modify(sql, params)
}

/**
 * soft delete the hdf entry
 * @param schoolId
 * @param userId
 * @return {Promise<any>}
 */
headteacherDeclarationDataService.sqlUndoSoftDeleteHdfEntry = async (schoolId, userId) => {
  const sql = `
    UPDATE [mtc_admin].[hdf]
    SET isDeleted = 0, deletedAt = NULL, deletedBy_userId = NULL
    WHERE school_id = @schoolId AND isDeleted = 1
  `

  const params = [
    { name: 'schoolId', type: TYPES.Int, value: schoolId },
    { name: 'userId', type: TYPES.Int, value: userId }
  ]
  return sqlService.modify(sql, params)
}

/**
 * hard delete the hdf entry
 * @param schoolId
 * @param userId
 * @return {Promise<any>}
 */
headteacherDeclarationDataService.sqlHardDeleteHdfEntry = async (schoolId) => {
  const sql = `
    DELETE [mtc_admin].[hdf]
    WHERE school_id = @schoolId
  `

  const params = [
    { name: 'schoolId', type: TYPES.Int, value: schoolId }
  ]
  return sqlService.modify(sql, params)
}

module.exports = headteacherDeclarationDataService
