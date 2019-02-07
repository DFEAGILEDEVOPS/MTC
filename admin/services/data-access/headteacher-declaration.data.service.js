'use strict'

const { TYPES } = require('tedious')
const R = require('ramda')
const sqlService = require('./sql.service')
const table = '[hdf]'
const headteacherDeclarationDataService = {}
const checkWindowDataService = require('./check-window.data.service')

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
 * Find the HDF for current check window
 * @param dfeNumber
 * @return {Promise<object|undefined>}
 */
headteacherDeclarationDataService.findCurrentHdfForSchool = async (dfeNumber) => {
  const checkWindow = await checkWindowDataService.sqlFindActiveCheckWindow()
  if (!checkWindow) {
    // we are not in a live check window
    return undefined
  }
  const paramDfeNumber = { name: 'dfeNumber', type: TYPES.Int, value: dfeNumber }
  const paramCheckWindow = { name: 'checkWindowId', type: TYPES.BigInt, value: checkWindow.id }
  const sql = `
  SELECT TOP 1 
    *
  FROM ${sqlService.adminSchema}.${table} h INNER JOIN school s ON h.school_id = s.id 
  WHERE h.checkWindow_id = @checkWindowId 
  AND s.dfeNumber = @dfeNumber`
  const result = await sqlService.query(sql, [paramCheckWindow, paramDfeNumber])
  // This will only return a single result as an object
  return R.head(result)
}

module.exports = headteacherDeclarationDataService
