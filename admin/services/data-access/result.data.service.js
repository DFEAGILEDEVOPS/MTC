'use strict'

const resultDataService = {}
const sqlService = require('./sql.service')
const TYPES = sqlService.TYPES
const R = require('ramda')

/**
 * Find pupils results data
 * @param {Number} schoolId
 * @returns {Promise<*>}
 */
resultDataService.sqlFindResultsBySchool = async (schoolId) => {
  const sql = `
    SELECT * FROM [mtc_admin].[vewPupilsResults]
    WHERE school_id = @schoolId
  `
  const params = [
    {
      name: 'schoolId',
      value: schoolId,
      type: TYPES.Int
    }
  ]
  return sqlService.query(sql, params)
}

/**
 * Find school score based on school id and check window id
 * @param {Number} schoolId
 * @param {Number} checkWindowId
 * @returns {Promise<*>}
 */
resultDataService.sqlFindSchoolScoreBySchoolIdAndCheckWindowId = async (schoolId, checkWindowId) => {
  const sql = `
  SELECT score
  FROM ${sqlService.adminSchema}.schoolScore
  WHERE school_id = @schoolId
  AND checkWindow_id = @checkWindowId
  `
  const params = [
    {
      name: 'checkWindowId',
      value: checkWindowId,
      type: TYPES.Int
    },
    {
      name: 'schoolId',
      value: schoolId,
      type: TYPES.Int
    }
  ]
  const result = await sqlService.query(sql, params)
  return R.head(result)
}

module.exports = resultDataService
