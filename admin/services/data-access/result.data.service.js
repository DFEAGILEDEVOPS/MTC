'use strict'

const resultDataService = {}
const sqlService = require('./sql.service')
const TYPES = require('tedious').TYPES
const R = require('ramda')

/**
 * Find pupils with scores
 * @param {Number} schoolId
 * @param {Number} checkWindowId
 * @returns {Promise<*>}
 */
resultDataService.sqlFindResultsBySchool = async (schoolId, checkWindowId) => {
  const sql = `
    SELECT
    p.foreName,
    p.lastName,
    p.middleNames,
    p.dateOfBirth,
    pg.group_id,
    latestPupilCheck.mark,
    ac.reason
    FROM ${sqlService.adminSchema}.pupil p
    LEFT OUTER JOIN
    (SELECT chk.pupil_id, chk.mark, ROW_NUMBER() OVER ( PARTITION BY chk.pupil_id ORDER BY chk.markedAt DESC ) as rank
      FROM ${sqlService.adminSchema}.[check] chk
      INNER JOIN ${sqlService.adminSchema}.checkStatus cs ON cs.id = chk.checkStatus_id
      WHERE cs.code = 'CMP'
      AND chk.checkWindow_id = @checkWindowId
    ) latestPupilCheck
      ON p.id = latestPupilCheck.pupil_id
    LEFT JOIN ${sqlService.adminSchema}.pupilAttendance pa
      ON (p.id = pa.pupil_id AND pa.isDeleted = 0)
    LEFT JOIN ${sqlService.adminSchema}.attendanceCode ac
      ON pa.attendanceCode_id = ac.id
    LEFT OUTER JOIN ${sqlService.adminSchema}.[pupilGroup] pg
      ON pg.pupil_id = p.id 
    WHERE (ac.code IS NULL OR ac.code NOT IN ('LEFTT', 'INCRG'))
    AND (latestPupilCheck.rank = 1 OR latestPupilCheck.rank IS NULL)
    AND p.school_id = @schoolId
    ORDER BY p.lastName ASC, p.foreName ASC, p.middleNames ASC, p.dateOfBirth ASC
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
