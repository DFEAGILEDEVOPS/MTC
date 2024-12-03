'use strict'

const { TYPES } = require('./sql.service')
const sqlService = require('./sql.service')
const R = require('ramda')

const service = {}

/**
 * Pupil Register Data Object
 * @typedef {Object} RegisterData
 * @property {string} dfeNumber - school dfe number (LA + Estab Code)
 * @property {string} schoolName - name of the school
 * @property {number} totalCount - total number of pupils on register
 */

/**
 * @description fetches register summary data from SQL data store
 * @param {number} schoolId
 * @return {Promise<RegisterData>}
 */
service.getRegisterData = async function getRegisterData (schoolId) {
  const schoolIdParam = {
    name: 'schoolId',
    type: TYPES.Int,
    value: schoolId
  }
  const sql = `
    SELECT
      COUNT(p.id) as [totalCount],
      MIN(s.name) as [schoolName],
      MIN(s.dfeNumber) as [dfeNumber]
    FROM
      [mtc_admin].[pupil] p
      INNER JOIN [mtc_admin].school s ON p.school_id = s.id
    WHERE p.school_id = @schoolId
    GROUP BY p.school_id`
  const result = await sqlService.readonlyQuery(sql, [schoolIdParam])
  return R.head(result)
}

/**
 * Pupil Register Data Object
 * @typedef {Object} LiveCheckData
 * @property {number} complete - number of pupils that have completed the check
 * @property {Date} date - short string formatted date
 * @property {number} loggedIn - number of pupils that have logged in
 * @property {number} pinsGenerated - number of pupil pins generated
 */

/**
 * @description fetches register summary data from SQL data store
 * @param {number} schoolId
 * @return {Promise<Array<LiveCheckData>>}
 */
service.getLiveCheckData = async function getLiveCheckData (schoolId) {
  const schoolIdParam = {
    name: 'schoolId',
    type: TYPES.Int,
    value: schoolId
  }
  const sql = `
    SELECT
      MIN(convert(varchar, c.createdAt, 106)) as [date],
      COUNT(c.id) AS [pinsGenerated],
      SUM(CASE WHEN c.pupilLoginDate IS NOT NULL THEN 1 ELSE 0 END) as [loggedIn],
      SUM(CAST(c.complete AS INT)) as [complete]
    FROM
      [mtc_admin].[check] c
      INNER JOIN [mtc_admin].pupil p ON (p.currentCheckId = c.id)
    WHERE p.school_id = @schoolId AND c.isLiveCheck = 1
    GROUP BY cast(c.createdAt as date);`
  return sqlService.readonlyQuery(sql, [schoolIdParam])
}

/**
 * Pupil Register Data Object
 * @typedef {Object} TryItOutCheckData
 * @property {Date} date - short string formatted date
 * @property {number} pinsGenerated - number of pupil pins generated
 */

/**
 * @description fetches register summary data from SQL data store
 * @param {number} schoolId
 * @return {Promise<Array<TryItOutCheckData>>}
 */
service.getTryItOutCheckData = async function getTryItOutCheckData (schoolId) {
  const schoolIdParam = {
    name: 'schoolId',
    type: TYPES.Int,
    value: schoolId
  }
  const sql = `
    SELECT
      MIN(convert(varchar, c.createdAt, 106)) as [date],
      COUNT(c.id) AS [pinsGenerated],
      SUM(CASE WHEN c.pupilLoginDate IS NOT NULL THEN 1 ELSE 0 END) as [loggedIn]
    FROM
      [mtc_admin].[check] c
      INNER JOIN [mtc_admin].pupil p ON (p.id = c.pupil_id)
    WHERE p.school_id = @schoolId AND c.isLiveCheck = 0
    GROUP BY cast(c.createdAt as date)`
  return sqlService.readonlyQuery(sql, [schoolIdParam])
}

module.exports = service
