'use strict'

const pupilStatusAnalysisService = require('./pupil-status-analysis.service')
const R = require('ramda')
const sqlService = require('../lib/sql/sql.service')
const { TYPES } = sqlService
const redisCacheService = require('../../admin/services/redis-cache.service')

async function recalculatePupilStatus (pupilId) {
  const currentData = await getCurrentPupilData(pupilId)
  const currentStatusCode = currentData.pupilStatusCode
  const targetStatusCode = pupilStatusAnalysisService.analysePupilData(currentData)

  if (currentStatusCode !== targetStatusCode) {
    await changePupilState(pupilId, targetStatusCode)
    console.log(`pupil-status: State change transition for pupil ${pupilId} from ${currentStatusCode} to ${targetStatusCode}`)
  }
}

async function getCurrentPupilData (pupilId) {
  const sql = `SELECT
    p.id                      as pupil_id,
    pstatus.code              as pupilStatusCode,
    lastCheck.id              as check_id,
    chkStatus.code            as checkStatusCode,
    lastPupilRestart.id       as pupilRestart_id,
    lastPupilRestart.check_id as pupilRestart_check_id,
    pa.id                     as pupilAttendance_id,
    CAST(ISNULL(pupilRestart.check_id, 0) AS BIT) as isRestartWithPinGenerated
  FROM
        [mtc_admin].[pupil] p
        INNER JOIN [mtc_admin].[pupilStatus] pstatus ON (p.pupilStatus_id = pstatus.id)
        LEFT OUTER JOIN
        (
           SELECT *,
              ROW_NUMBER() OVER (PARTITION BY pupil_id ORDER BY id DESC) as rank
           FROM [mtc_admin].[check]
           WHERE isLiveCheck = 1
        ) lastCheck ON (lastCheck.pupil_id = p.id)
        LEFT OUTER JOIN [mtc_admin].[checkStatus] chkStatus ON (lastCheck.checkStatus_id = chkStatus.id)
        LEFT OUTER JOIN [mtc_admin].[pupilAttendance] pa ON (pa.pupil_id = p.id AND pa.isDeleted = 0)
        LEFT OUTER JOIN (
         SELECT *,
                ROW_NUMBER() OVER (PARTITION BY pupil_id ORDER BY id DESC) as rank
         FROM [mtc_admin].[pupilRestart]
         WHERE isDeleted = 0
       ) lastPupilRestart ON (p.id = lastPupilRestart.pupil_id)
       LEFT OUTER JOIN [mtc_admin].[pupilRestart] pupilRestart ON (pupilRestart.check_id = lastCheck.id)
  WHERE
        p.id = @pupilId
  AND   (lastCheck.rank = 1 or lastCheck.rank IS NULL)
  AND   (lastPupilRestart.rank = 1 or lastPupilRestart.rank IS NULL); `

  const params = [
    { name: 'pupilId', value: pupilId, type: TYPES.Int }
  ]

  const res = await sqlService.query(sql, params)
  return R.head(res)
}

async function getPupilStatusID (targetStatusCode) {
  const rows = await redisCacheService.get('table.pupilStatus')
  if (!rows) {
    const sql = `SELECT id FROM [mtc_admin].[pupilStatus] WHERE code = @code`
    const params = [
      { name: 'code', value: targetStatusCode, type: TYPES.NVarChar }
    ]
    const results = await sqlService.query(sql, params)
    return results[0].id
  } else {
    return rows.find(r => r.code === targetStatusCode).id
  }
}

async function changePupilState (pupilId, targetStatusCode) {
  const statusID = await getPupilStatusID(targetStatusCode)
  const pupils = await redisCacheService.get('table.pupil')
  if (pupils) {
    const pupilsLn = pupils.length
    for (let i = 0; i < pupilsLn; i++) {
      if (pupils[i].id === pupilId) {
        pupils[i].pupilStatus_id = statusID
        break
      }
    }
    return redisCacheService.set('table.pupil', pupils)
  } else {
    const sql = `UPDATE [mtc_admin].[pupil]
                 SET pupilStatus_id = @statusID
                 WHERE id = @pupilId`
    const params = [
      { name: 'statusID', value: statusID, type: TYPES.Int },
      { name: 'pupilId', value: pupilId, type: TYPES.Int }
    ]
    return sqlService.modify(sql, params)
  }
}

module.exports = {
  recalculatePupilStatus
}
