'use strict'

const { TYPES } = require('./sql.service')
const sqlService = require('./sql.service')
const pupilStatusDataService = {}

pupilStatusDataService.sqlFindPupilsFullStatus = async function sqlFindPupilsAndAttendanceReasons (schoolId) {
  if (!schoolId) {
    throw new Error('schoolId param is required')
  }
  const paramSchoolId = { name: 'schoolId', type: TYPES.Int, value: schoolId }
  const sql = `
  SELECT
    p.foreName,
    p.lastName,
    p.middleNames,
    p.dateOfBirth,
    p.group_id,
    p.urlSlug,
    cs.code as checkStatusCode,
    ac.reason,
    ac.code as reasonCode,

    -- the following fields are required to produce the pupil status
    p.attendanceId,
    p.checkComplete as pupilCheckComplete,
    p.currentCheckId,
    p.id as pupilId,
    p.restartAvailable,
    chk.received as checkReceived,
    chk.complete as checkComplete,
    chk.processingFailed,
    chk.pupilLoginDate,
    cp.pinExpiresAt
  FROM
    [mtc_admin].[pupil] p LEFT JOIN
    [mtc_admin].[check] chk ON (p.currentCheckId = chk.id) LEFT JOIN
    [mtc_admin].[checkStatus] cs ON (chk.checkStatus_id = cs.id) LEFT JOIN
    [mtc_admin].[attendanceCode] ac ON (p.attendanceId = ac.id) LEFT JOIN
    [mtc_admin].[checkPin] cp ON (chk.id = cp.check_id)
  WHERE
    p.school_id = @schoolId
  `
  return sqlService.readonlyQuery(sql, [paramSchoolId])
}

module.exports = pupilStatusDataService
