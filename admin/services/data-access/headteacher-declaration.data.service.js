'use strict'

const { TYPES } = require('tedious')
const R = require('ramda')
const sqlService = require('./sql.service')
const table = '[hdf]'
const headteacherDeclarationDataService = {}

headteacherDeclarationDataService.sqlCreate = async function (data) {
  return sqlService.create(table, data)
}

/**
 * Return the last HDF submitted for a school
 * @param {number} schoolId
 * @return {Promise<void>}
 */
headteacherDeclarationDataService.sqlFindLatestHdfBySchoolId = async (schoolId) => {
  const sql = `SELECT TOP 1 * FROM ${sqlService.adminDb}.${table} WHERE school_id = @schoolId
  ORDER BY signedDate DESC`
  const paramSchoolId = { name: 'schoolId', type: TYPES.Int, value: schoolId }
  const rows = await sqlService.query(sql, [paramSchoolId])
  return R.head(rows)
}

module.exports = headteacherDeclarationDataService
