'use strict'

const schoolScoreDataService = {}
const sqlService = require('./sql.service')
const TYPES = require('tedious').TYPES
const R = require('ramda')

/**
 * Find school score based on school id and check window id
 * @param {Number} schoolId
 * @param {Number} checkWindowId
 * @returns {Promise<*>}
 */
schoolScoreDataService.sqlFindSchoolScoreBySchoolIdAndCheckWindowId = async (schoolId, checkWindowId) => {
  const sql = `
  SELECT score
  FROM mtc_admin.schoolScore
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

module.exports = schoolScoreDataService
