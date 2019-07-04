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
  AND school_id = @schoolID`
  const result = await sqlService.query(sql, [paramCheckWindow, paramSchoolId])
  // This will only return a single result as an object
  return R.head(result)
}

/**
 * Find count of pupils blocking hdf submission before check end date
 * @param schoolId
 * @return {Number}
 */
headteacherDeclarationDataService.sqlFindPupilsBlockingHdfBeforeCheckEndDate = async (schoolId) => {
  const sql = `
    SELECT COUNT(p.id) as pupilsCount
    FROM [mtc_admin].[pupil] p
    JOIN [mtc_admin].[pupilStatus] ps ON (p.pupilStatus_id = ps.id)
    WHERE p.school_id = @schoolId
    AND ps.code NOT IN ('NOT_TAKING', 'COMPLETED')
  `

  const params = [
    { name: 'schoolId', type: TYPES.Int, value: schoolId }
  ]

  const result = await sqlService.query(sql, params)
  return R.path(['pupilsCount'], R.head(result))
}

/**
 * Find count of pupils blocking hdf submission before check end date
 * @param schoolId
 * @return {Number}
 */
headteacherDeclarationDataService.sqlFindPupilsBlockingHdfAfterCheckEndDate = async (schoolId) => {
  const sql = `
    SELECT COUNT(p.id) as pupilsCount
    FROM [mtc_admin].[pupil] p
    JOIN [mtc_admin].[pupilStatus] ps ON (p.pupilStatus_id = ps.id)
    LEFT JOIN (
        SELECT *,
            ROW_NUMBER() OVER (PARTITION BY pupil_id ORDER BY id DESC) as rank
        FROM [mtc_admin].[check]
        WHERE isLiveCheck = 1
           ) lastCheck ON (lastCheck.pupil_id = p.id)
    LEFT JOIN [mtc_admin].[checkStatus] cs ON (lastCheck.checkStatus_id = cs.id)
    WHERE p.school_id = @schoolId
    AND (lastCheck.rank = 1 or lastCheck.rank IS NULL)
    AND (ps.code != 'STARTED' OR cs.code != 'NTR')
    AND ps.code NOT IN ('NOT_TAKING', 'COMPLETED') 
  `

  const params = [
    { name: 'schoolId', type: TYPES.Int, value: schoolId }
  ]

  const result = await sqlService.query(sql, params)
  return R.path(['pupilsCount'], R.head(result))
}

/**
 * Fetch all pupils for a school by dfeNumber with their status codes and attendance reasons
 * @param schoolId
 * @returns {Promise<*>}
 */
headteacherDeclarationDataService.sqlFindPupilsWithStatusAndAttendanceReasons = async function (schoolId) {
  const paramDfeNumber = { name: 'schoolId', type: TYPES.Int, value: schoolId }

  const sql = `
    SELECT
       p.foreName,
       p.lastName,
       p.middleNames,
       p.dateOfBirth,
       p.urlSlug,
       ps.code AS pupilStatusCode,
       cs.code AS checkStatusCode,
       pg.group_id,
       ac.reason,
       ac.code as reasonCode
    FROM [mtc_admin].pupil p
    JOIN [mtc_admin].pupilStatus ps
        ON p.pupilStatus_id = ps.id
    LEFT JOIN [mtc_admin].[pupilAttendance] pa
        ON p.id = pa.pupil_id AND (pa.isDeleted IS NULL OR pa.isDeleted = 0)
    LEFT JOIN [mtc_admin].[attendanceCode] ac
        ON pa.attendanceCode_id = ac.id
    LEFT JOIN [mtc_admin].[pupilGroup] pg
        ON pg.pupil_id = p.id
    LEFT JOIN (
        SELECT *,
            ROW_NUMBER() OVER (PARTITION BY pupil_id ORDER BY id DESC) as rank
        FROM [mtc_admin].[check]
        WHERE isLiveCheck = 1
       ) lastCheck ON (lastCheck.pupil_id = p.id AND lastCheck.rank = 1)
    LEFT JOIN [mtc_admin].[checkStatus] cs ON (lastCheck.checkStatus_id = cs.id)
    WHERE p.school_id = @schoolId
  `
  return sqlService.query(sql, [paramDfeNumber])
}

module.exports = headteacherDeclarationDataService
