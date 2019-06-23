'use strict'

const R = require('ramda')
const sqlService = require('../lib/sql/sql.service')
const { TYPES } = sqlService

const azureStorageHelper = require('../lib/azure-storage-helper')
const pupilStatusAnalysisService = require('./pupil-status-analysis.service')

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

async function changePupilState (pupilId, targetStatusCode) {
  const sql = `UPDATE [mtc_admin].[pupil]
               SET pupilStatus_id = (SELECT id from [mtc_admin].[pupilStatus] WHERE code = @code)
               WHERE id = @pupilId`
  const params = [
    { name: 'code', value: targetStatusCode, type: TYPES.NVarChar },
    { name: 'pupilId', value: pupilId, type: TYPES.Int }
  ]
  return sqlService.modify(sql, params)
}

/**
 * Filter for live checks and make a request for the pupil-status to be updated for multiple pupils on v2
 * @param {Object} logger
 * @param {String} logPrefix
 * @param {[{checkId: <number>, pupilId: <number>, checkCode: <string>, isLiveCheck: <boolean>}]} checkData - must contain `checkId`, `pupilId`, `checkCode` and `isLiveCheck` props
 * @return {Promise<*|Promise<*>>}
 */
async function updatePupilStatusForLiveChecksV2 (logger, logPrefix, checkData) {
  if (!checkData || !Array.isArray(checkData)) {
    logger.error(`${logPrefix}: updatePupilStatusV2(): ERROR: check data provided must be an array`)
    return
  }
  logger.info(`${logPrefix}: updatePupilStatusV2(): got ${checkData.length} pupils`)
  // Batch the async messages up for live checks only, to limit max concurrency
  const batches = R.splitEvery(100, R.filter(c => c.isLiveCheck, checkData))
  checkData = null
  batches.forEach(async (checks, batchNumber) => {
    try {
      await azureStorageHelper.addMessageToQueue('pupil-status', {
        version: 2,
        messages: checks
      })
      logger.verbose(`${logPrefix}: batch ${batchNumber} complete`)
    } catch (error) {
      logger.error(`${logPrefix}: updatePupilStatusV2(): ERROR: ${error.message}`)
    }
  })
}

module.exports = {
  recalculatePupilStatus,
  updatePupilStatusForLiveChecksV2
}
