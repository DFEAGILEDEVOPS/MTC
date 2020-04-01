'use strict'

const { TYPES } = require('./sql.service')
const sqlService = require('./sql.service')
const R = require('ramda')

const service = {}

/**
 * @description fetches register summary data from SQL data store
 * @param {number} schoolId
 * @return {Promise<object>}
 */
service.getRegisterData = async (schoolId) => {
  const schoolIdParam = {
    name: 'schoolId',
    type: TYPES.Int,
    value: schoolId
  }
  const sql = `
    SELECT
      COUNT(p.id) as [TotalCount],
      SUM(CASE WHEN p.checkComplete = 1 AND p.attendanceId IS NULL THEN 1 ELSE 0 END) as [Completed],
      SUM(CASE WHEN p.attendanceId IS NOT NULL THEN 1 ELSE 0 END) as [NotAttending],
      MIN(s.name) as [schoolName],
      MIN(s.dfeNumber) as [dfeNumber]
    FROM
      [mtc_admin].[pupil] p
      INNER JOIN [mtc_admin].school s ON p.school_id = s.id
    WHERE p.school_id = @schoolId`
  const result = await sqlService.readonlyQuery(sql, [schoolIdParam])
  return R.head(result)
}

service.getLiveCheckData = async (schoolId) => {
  const schoolIdParam = {
    name: 'schoolId',
    type: TYPES.Int,
    value: schoolId
  }
  const sql = `
    SELECT
        MIN(convert(varchar, c.createdAt, 106)) as [Date],
        COUNT(c.id) AS [PinsGenerated],
        SUM(CASE cs.code WHEN 'COL' THEN 1 ELSE 0 END) as [LoggedIn],
        SUM(CASE cs.code WHEN 'CMP' THEN 1 ELSE 0 END) as [Complete]
    FROM
        [mtc_admin].[check] c
        INNER JOIN [mtc_admin].pupil p ON (p.currentCheckId = c.id)
        LEFT JOIN [mtc_admin].[checkStatus] cs ON (c.checkStatus_id = cs.id)
    WHERE p.school_id = @schoolId AND c.isLiveCheck = 1
    GROUP BY cast(c.createdAt as date)`
  return sqlService.readonlyQuery(sql, [schoolIdParam])
}

service.getTioCheckData = async (schoolId) => {
  const schoolIdParam = {
    name: 'schoolId',
    type: TYPES.Int,
    value: schoolId
  }
  const sql = `
    SELECT
      MIN(convert(varchar, c.createdAt, 106)) as [Date],
      COUNT(c.id) AS [PinsGenerated]
    FROM
      [mtc_admin].[check] c
      INNER JOIN [mtc_admin].pupil p ON (p.id = c.pupil_id)
    WHERE p.school_id = @schoolId AND c.isLiveCheck = 0
    GROUP BY cast(c.createdAt as date)`
  return sqlService.readonlyQuery(sql, [schoolIdParam])
}

module.exports = service
