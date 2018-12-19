'use strict'

const config = require('../config')
const pupilStatusAnalysisService = require('./pupil-status-analysis.service')
const R = require('ramda')
const sqlService = require('less-tedious')
const { TYPES } = require('tedious')
sqlService.initialise(config)

async function recalculatePupilStatus (pupilId) {
  const currentData = await getCurrentPupilData(pupilId)
  const currentStatusCode = R.head(currentData).pupilStatusCode
  const targetStatusCode = pupilStatusAnalysisService.analysePupilData(currentData)

  if (currentStatusCode !== targetStatusCode) {
    await changePupilState(pupilId, targetStatusCode)
    console.log(`pupil-status: State change transition for pupil ${pupilId} from ${currentStatusCode} to ${targetStatusCode}`)
  }
}

async function getCurrentPupilData (pupilId) {
  const sql = `SELECT 
    p.id as pupil_id,
    pstatus.code as pupilStatusCode,
    chk.id as check_id,
    chkStatus.code as checkStatusCode,
    pr.id as pupilRestart_id,
    pr.check_id as pupilRestart_check_id,
    pa.id as pupilAttendance_id
  FROM 
        ${sqlService.adminSchema}.[pupil] p
        INNER JOIN ${sqlService.adminSchema}.[pupilStatus] pstatus ON (p.pupilStatus_id = pstatus.id)
        LEFT OUTER JOIN ${sqlService.adminSchema}.[check] chk ON (p.id = chk.pupil_id)
        LEFT OUTER JOIN ${sqlService.adminSchema}.[checkStatus] chkStatus ON (chk.checkStatus_id = chkStatus.id AND chk.isLiveCheck = 1)
        LEFT OUTER JOIN ${sqlService.adminSchema}.[pupilAttendance] pa ON (pa.pupil_id = p.id AND pa.isDeleted = 0)
        LEFT OUTER JOIN ${sqlService.adminSchema}.[pupilRestart] pr ON (p.id = pr.pupil_id AND pr.isDeleted = 0)
  WHERE p.id = @pupilId
  ORDER BY chk.id ASC`

  const params = [
    { name: 'pupilId', value: pupilId, type: TYPES.Int }
  ]

  return sqlService.query(sql, params)
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
