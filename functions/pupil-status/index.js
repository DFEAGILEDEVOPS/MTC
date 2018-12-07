'use strict'

const moment = require('moment')
const sqlService = require('less-tedious')
const uuid = require('uuid/v4')
const { TYPES } = require('tedious')
const R = require('ramda')

const config = require('../config')
sqlService.initialise(config)
const pupilStatusAnalysisService = require('./pupil-status-analysis.service')

/**
 * Re-compute the pupil status and write it to the Admin database
 * @param context
 * @param pupilStatusMessage
 * @return {Promise<void>}
 */
module.exports = async function (context, pupilStatusMessage) {
  context.log(`pupil-status: message received for pupilId ${pupilStatusMessage.pupilId} with checkCode ${pupilStatusMessage.checkCode}`)

  if (typeof pupilStatusMessage !== 'object') {
    throw new Error('pupil-status: Badly formed message')
  }

  if (!pupilStatusMessage.hasOwnProperty('pupilId')) {
    throw new Error('pupil-status: Invalid message. Missing pupilId.')
  }

  if (!pupilStatusMessage.hasOwnProperty('checkCode')) {
    throw new Error('pupil-status: Invalid message. Missing checkCode.')
  }

  try {
    await recalculatePupilStatus(pupilStatusMessage.pupilId)
  } catch (error) {
    context.log.error('pupil-status: Failed to recalculate pupil status')
    throw error
  }

  // Store the raw message to an audit log
  context.bindings.pupilEventsTable = []
  const entity = {
    // TODO will we always have a check code?
    PartitionKey: pupilStatusMessage.checkCode,
    RowKey: uuid(),
    eventType: 'pupil-status',
    payload: JSON.stringify(pupilStatusMessage),
    processedAt: moment().toDate()
  }

  context.bindings.pupilEventsTable.push(entity)
}

async function recalculatePupilStatus (pupilId) {
  const currentData = await getCurrentPupilData(pupilId)
  // console.log('Current data ', currentData)
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
