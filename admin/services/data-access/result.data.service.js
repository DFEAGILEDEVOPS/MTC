'use strict'

const resultDataService = {}
const sqlService = require('./sql.service')
const TYPES = require('tedious').TYPES

/**
 * Find pupils with scores
 * @param {Number} schoolId
 * @param {Number} checkWindowId
 * @returns {Promise<*>}
 */
resultDataService.sqlFindPupilsWithScoresBySchoolIdAndCheckWindowId = async (schoolId, checkWindowId) => {
  const sql = `
    SELECT
    p.foreName,
    p.lastName,
    p.dateOfBirth,
    latestPupilCheck.mark,
    ac.reason
    FROM mtc_admin.pupil p
    LEFT OUTER JOIN
    (SELECT chk.pupil_id, chk.mark, ROW_NUMBER() OVER ( PARTITION BY chk.pupil_id ORDER BY chk.markedAt DESC ) as rank
      FROM mtc_admin.[check] chk
      INNER JOIN mtc_admin.checkStatus cs ON cs.id = chk.checkStatus_id
      WHERE cs.code = 'CMP'
      AND chk.checkWindow_id = @checkWindowId
    ) latestPupilCheck
      ON p.id = latestPupilCheck.pupil_id
    LEFT JOIN mtc_admin.pupilAttendance pa
      ON (p.id = pa.pupil_id AND pa.isDeleted = 0)
    LEFT JOIN mtc_admin.attendanceCode ac
      ON pa.attendanceCode_id = ac.id
    WHERE (ac.code IS NULL OR ac.code NOT IN ('LEFTT', 'INCRG'))
    AND (latestPupilCheck.rank = 1 OR latestPupilCheck.rank IS NULL)
    AND p.school_id = @schoolId
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

module.exports = resultDataService
