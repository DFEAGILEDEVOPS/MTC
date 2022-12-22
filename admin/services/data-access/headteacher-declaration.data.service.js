'use strict'

const { TYPES } = require('./sql.service')
const R = require('ramda')
const sqlService = require('./sql.service')
const table = '[hdf]'
const service = {}

service.sqlCreate = async function (data) {
  return sqlService.create(table, data)
}

/**
 * Return the last HDF submitted for a school and the check end date
 * for the check window the HDF was submitted in
 * @param {number} schoolId
 * @return {Promise<object>}
 */
service.sqlFindLatestHdfBySchoolId = async (schoolId) => {
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
service.sqlFindHdfForCheck = async (schoolId, checkWindowId) => {
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
 * Find count of pupils who are incomplete and have no attendance set
 * @param schoolId
 * @return {Promise<Number>}
 */
service.pupilCountWithNoFinalState = async (schoolId) => {
  const sql = `
    SELECT COUNT(p.id) as pupilCount
    FROM mtc_admin.pupil p
    WHERE (p.attendanceId IS NULL
      and p.checkComplete = 0)
      and p.school_id = @schoolId`
  const params = [{
    name: 'schoolId',
    type: TYPES.Int,
    value: schoolId
  }]
  const result = await sqlService.query(sql, params)
  return R.path(['pupilCount'], R.head(result))
}

module.exports = service
