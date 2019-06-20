'use strict'

const resultDataService = {}
const sqlService = require('./sql.service')
const TYPES = sqlService.TYPES
const R = require('ramda')

/**
 * Find pupil data excluding results relevant data
 * @param {Number} schoolId
 * @param {Number} checkWindowId
 * @returns {Promise<*>}
 */
resultDataService.getPupilRegisterData = async (schoolId, checkWindowId) => {
  const sql = `
    SELECT
        p.id,
        p.foreName,
        p.middleNames,
        p.lastName,
        p.dateOfBirth,
        g.id as group_id,
        ps.code as pupilStatusCode,
        lastPupilRestart.id as pupilRestartId,
        lastPupilRestart.check_id as pupilRestartCheckId
    FROM [mtc_admin].[pupil] p
    JOIN [mtc_admin].[pupilStatus] ps
        ON (p.pupilStatus_id = ps.id)
    LEFT JOIN [mtc_admin].[pupilGroup] pg
        ON (p.id = pg.pupil_id)
    LEFT JOIN [mtc_admin].[group] g
        ON (pg.group_id = g.id)
    LEFT JOIN
        (SELECT
            pr.id,
            pr.pupil_id,
            pr.check_id,
            ROW_NUMBER() OVER (PARTITION BY pupil_id ORDER BY pr.id DESC) as rank
         FROM [mtc_admin].[pupilRestart] pr
         WHERE isDeleted = 0
        ) lastPupilRestart
        ON (p.id = lastPupilRestart.pupil_id)
    LEFT JOIN [mtc_admin].pupilAttendance pa
        ON (p.id = pa.pupil_id AND pa.isDeleted = 0)
    LEFT JOIN [mtc_admin].attendanceCode ac
        ON pa.attendanceCode_id = ac.id
    WHERE (ac.code IS NULL OR ac.code NOT IN ('LEFTT', 'INCRG'))
    AND (lastPupilRestart.rank = 1 or lastPupilRestart.rank IS NULL)
    AND p.school_id = @schoolId
   `

  const params = [
    { name: 'schoolId', value: schoolId, type: TYPES.Int },
    { name: 'checkWindowId', value: checkWindowId, type: TYPES.Int }
  ]

  return sqlService.query(sql, params)
}

/**
 * Find pupils with scores
 * @param {Number} schoolId
 * @param {Number} checkWindowId
 * @returns {Promise<*>}
 */
resultDataService.sqlFindResultsBySchool = async (schoolId, checkWindowId) => {
  const sql = `
    SELECT
        p.id,
        latestPupilCheck.mark,
        latestPupilCheck.maxMark,
        cs.code as checkStatusCode,
        ac.reason
    FROM [mtc_admin].pupil p
    LEFT OUTER JOIN
        (SELECT
          chk.pupil_id,
          chk.checkStatus_id,
          chk.mark,
          chk.maxMark,
          ROW_NUMBER() OVER ( PARTITION BY chk.pupil_id ORDER BY chk.id DESC ) as rank
        FROM [mtc_admin].[check] chk
        INNER JOIN [mtc_admin].checkStatus cs
          ON cs.id = chk.checkStatus_id
          AND cs.code IN ('NTR', 'CMP')
          AND chk.checkWindow_id = @checkWindowId
          AND chk.isLiveCheck = 1
        ) latestPupilCheck
        ON p.id = latestPupilCheck.pupil_id
    LEFT JOIN [mtc_admin].[checkStatus] cs
        ON (latestPupilCheck.checkStatus_id = cs.id)
    LEFT JOIN [mtc_admin].pupilAttendance pa
        ON (p.id = pa.pupil_id AND pa.isDeleted = 0)
    LEFT JOIN [mtc_admin].attendanceCode ac
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
