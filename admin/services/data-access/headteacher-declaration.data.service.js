'use strict'

const { TYPES } = require('./sql.service')
const R = require('ramda')
const sqlService = require('./sql.service')
const table = '[hdf]'
const headteacherDeclarationDataService = {}

headteacherDeclarationDataService.sqlCreate = async function (data) {
  return sqlService.create(table, data)
}

/**
 * Return the last HDF submitted for a school and the check end date
 * for the check window the HDF was submitted in
 * @param {number} schoolId
 * @return {Promise<object>}
 */
headteacherDeclarationDataService.sqlFindLatestHdfBySchoolId = async (schoolId) => {
  const sql = `
  SELECT TOP 1
    h.*, c.checkEndDate
  FROM ${sqlService.adminSchema}.${table} h
  INNER JOIN checkWindow c ON h.checkWindow_id = c.id
  WHERE school_id = @schoolId
  ORDER BY signedDate DESC`
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
  FROM ${sqlService.adminSchema}.${table}
  WHERE checkWindow_id = @checkWindowId
  AND school_id = @schoolId`
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
headteacherDeclarationDataService.sqlFindPupilsBlockingHdfBeforeCheckEndDate = async (schoolId) => {
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
 * Find count of pupils blocking hdf submission after check end date
 * Blocking pupils are defined as pupils who have not completed the check, or at least attempted the check (and are not
 * marked as not-attending)
 * @param schoolId
 * @return {Promise<Number>}
 */
headteacherDeclarationDataService.sqlFindPupilsBlockingHdfAfterCheckEndDate = async (schoolId) => {
  const sql = `
    SELECT COUNT(p.id) as pupilsCount
    FROM [mtc_admin].[pupil] p
    LEFT JOIN [mtc_admin].[check] chk ON (p.currentCheckId = chk.id)
    WHERE (p.attendanceId IS NULL
          AND (p.currentCheckId is NULL OR chk.pupilLoginDate IS NOT NULL))
  `

  const params = [
    { name: 'schoolId', type: TYPES.Int, value: schoolId }
  ]

  const result = await sqlService.query(sql, params)
  return R.path(['pupilsCount'], R.head(result))
}

headteacherDeclarationDataService.sqlFindPupilsFullStatus = async function sqlFindPupilsAndAttendanceReasons (schoolId) {
  if (!schoolId) {
    throw new Error('schoolId param is required')
  }
  const paramSchoolId = { name: 'schoolId', type: TYPES.Int, value: schoolId }
  const sql = `
  SELECT
    p.foreName,
    p.lastName,
    p.middleNames,
    p.dateOfBirth,
    p.group_id,
    p.urlSlug,
    cs.code as checkStatusCode,
    ac.reason, 
    ac.code as reasonCode,

    -- the following fields are required to produce the HDF pupil status for the Heads review
    p.attendanceId,
    p.checkComplete as pupilCheckComplete,
    p.currentCheckId,
    p.id as pupilId,
    p.restartAvailable,
    chk.received as checkReceived,
    chk.complete as checkComplete,
    chk.pupilLoginDate,
    cp.pinExpiresAt
  FROM
    [mtc_admin].[pupil] p LEFT JOIN  
    [mtc_admin].[check] chk ON (p.currentCheckId = chk.id) LEFT JOIN  
    [mtc_admin].[checkStatus] cs ON (chk.checkStatus_id = cs.id) LEFT JOIN 
    [mtc_admin].[attendanceCode] ac ON (p.attendanceId = ac.id) LEFT JOIN
    [mtc_admin].[checkPin] cp ON (chk.id = cp.check_id)
  WHERE
    p.school_id = @schoolId  
  `
  return sqlService.readonlyQuery(sql, [paramSchoolId])
}

module.exports = headteacherDeclarationDataService
