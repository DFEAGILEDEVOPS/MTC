'use strict'

const { TYPES } = require('./sql.service')
const sqlService = require('./sql.service')
const R = require('ramda')

const service = {}

service.getRegisterSummaryData = async (schoolId) => {
  const schoolIdParam = {
    name: 'schoolId',
    type: TYPES.Int,
    value: schoolId
  }
  const sql = `
    SELECT
      COUNT(p.id) as [TotalCount],
      SUM(CASE WHEN p.checkComplete = 1 AND p.attendanceId IS NULL THEN 1 ELSE 0 END) as [Completed],
      SUM(CASE WHEN p.attendanceId IS NOT NULL THEN 1 ELSE 0 END) as [NotAttending]
    FROM
      mtc_admin.pupil p
    WHERE p.school_id = @schoolId`
  const result = await sqlService.readOnlyQuery(sql, [schoolIdParam])
  return R.head(result)
}

module.exports = service
