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
 * Return the last HDF submitted for a school
 * @param {number} schoolId
 * @return {Promise<void>}
 */
headteacherDeclarationDataService.sqlFindLatestHdfBySchoolId = async (schoolId) => {
  const sql = `SELECT TOP 1 * FROM ${table} WHERE school_id = @schoolId
  ORDER BY signedDate DESC`
  const paramSchoolId = { name: 'schoolId', type: TYPES.Int, value: schoolId }
  const rows = await sqlService.query(sql, [paramSchoolId])
  return R.head(rows)
}

/**
 * Find the HDF for current check window
 * @param dfeNumber
 * @return {Promise<void>}
 */
headteacherDeclarationDataService.findCurrentHdfForSchool = async (dfeNumber) => {
  const checkWindow = checkWindowDataService.sqlFindCurrentCheckWindow()
  if (!checkWindow) {
    // we are not in a live check window
    return undefined
  }
  const paramDfeNumber = { name: 'dfeNumber', type: TYPES.Int, value: dfeNumber }
  const paramCheckWindow = { name: 'checkWindowId', type: TYPES.BigInt, value: checkWindow.id }
  const sql = `SELECT * from ${table} h INNER JOIN school s ON h.school_id = school.id 
  WHERE h.checkWindow_id = @checkWindowId 
  AND s.dfeNumber = @dfeNumber`
  const result = await sqlService.query(table, sql, [paramCheckWindow, paramDfeNumber])
  // This will only return a single result
  return R.head(result)
}

module.exports = headteacherDeclarationDataService
