'use strict'

const config = require('../config')
const pupilStatusAnalysisService = require('./pupil-status-analysis.service')
const R = require('ramda')
const sqlService = require('less-tedious')
const { TYPES } = require('tedious')
sqlService.initialise(config)

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
    pa.id                     as pupilAttendance_id
  FROM 
        ${sqlService.adminSchema}.[pupil] p
        INNER JOIN ${sqlService.adminSchema}.[pupilStatus] pstatus ON (p.pupilStatus_id = pstatus.id)
        LEFT OUTER JOIN  
        (
           SELECT *,
              ROW_NUMBER() OVER (PARTITION BY pupil_id ORDER BY id DESC) as rank
           FROM [mtc_admin].[check]
           WHERE isLiveCheck = 1
        ) lastCheck ON (lastCheck.pupil_id = p.id)
        LEFT OUTER JOIN ${sqlService.adminSchema}.[checkStatus] chkStatus ON (lastCheck.checkStatus_id = chkStatus.id)
        LEFT OUTER JOIN ${sqlService.adminSchema}.[pupilAttendance] pa ON (pa.pupil_id = p.id AND pa.isDeleted = 0)
        LEFT OUTER JOIN (
         SELECT *,
                ROW_NUMBER() OVER (PARTITION BY pupil_id ORDER BY id DESC) as rank
         FROM [mtc_admin].[pupilRestart]
         WHERE isDeleted = 0
       ) lastPupilRestart ON (p.id = lastPupilRestart.pupil_id)
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

async function changePupilState (pupilId, targetStatusCode) {
  const sql = `UPDATE ${sqlService.adminSchema}.[pupil]
               SET pupilStatus_id = (SELECT id from ${sqlService.adminSchema}.[pupilStatus] WHERE code = @code)
               WHERE id = @pupilId`
  const params = [
    { name: 'code', value: targetStatusCode, type: TYPES.NVarChar },
    { name: 'pupilId', value: pupilId, type: TYPES.Int }
  ]
  return sqlService.modify(sql, params)
}

module.exports = {
  recalculatePupilStatus
}
