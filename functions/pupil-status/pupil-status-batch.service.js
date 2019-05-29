'use strict'

const pupilStatusAnalysisService = require('./pupil-status-analysis.service')
const sqlService = require('../lib/sql/sql.service')
const { TYPES } = sqlService
const pupilStatusRedisService = require('./pupil-status-redis.service')

async function recalculatePupilStatus (context, pupilIds) {
  if (!Array.isArray(pupilIds)) {
    throw new Error('recalculatePupilStatus: invalid param pupilIds')
  }

  const currentData = await getCurrentPupilsData(pupilIds)

  const updates = []
  currentData.forEach(row => {
    const currentStatusCode = currentData.pupilStatusCode
    const targetStatusCode = pupilStatusAnalysisService.analysePupilData(row)
    if (currentStatusCode !== targetStatusCode) {
      updates.push({ pupilId: row.pupil_id, targetStatusCode })
    }
  })

  await updatePupilStatuses(updates, context)
}

/**
 * Fetch data for an array of pupils
 * @param {[number]} pupilIds
 * @return {Promise<*>}
 */
async function getCurrentPupilsData (pupilIds) {
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
        LEFT JOIN [mtc_admin].[pupilStatusLink] psl ON psl.pupil_id = p.id
        INNER JOIN [mtc_admin].[pupilStatus] pstatus ON (ISNULL(psl.pupilStatus_id, 1) = pstatus.id)
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
        p.id IN (${pupilIds.map((o, i) => '@pupilId' + i).join(', ')})
  AND   (lastCheck.rank = 1 or lastCheck.rank IS NULL)
  AND   (lastPupilRestart.rank = 1 or lastPupilRestart.rank IS NULL);
  `
  const params = pupilIds.map((pupilId, i) => { return { name: `pupilId${i}`, value: pupilId, type: TYPES.Int } })
  return sqlService.query(sql, params)
}

/**
 *
 * @param {[{name: <string>, value: <any>}]} params
 */
function parseParams (params) {
  const output = []
  params.forEach(p => {
    output.push(`${p.name}:${p.value}`)
  })
  return output.join('\n')
}

/**
 * Update a batch of pupils in one sql call
 * @param {[{pupilId: <number>, targetStatusCode: <string>}]} updates
 */
const updatePupilStatuses = async (updates, context) => {
  await pupilStatusRedisService.updatePupilStatuses(updates, context)

  const sql = []
  const params = []

  updates.forEach((o, i) => {
    sql.push(`
      IF EXISTS (SELECT * FROM mtc_admin.pupilStatusLink WHERE pupil_id=@pupilId${i})
        UPDATE mtc_admin.pupilStatusLink
        SET
          pupilStatus_id = (SELECT id from mtc_admin.pupilStatus WHERE code=@code${i}),
          updatedAt = GETUTCDATE()
        WHERE pupil_id=@pupilId${i}
      ELSE
        INSERT INTO mtc_admin.pupilStatusLink (pupil_id, pupilStatus_id)
        VALUES (
          @pupilId${i},
          (SELECT id from mtc_admin.pupilStatus WHERE code=@code${i})
        )
    `)
    params.push({ name: `code${i}`, value: o.targetStatusCode, type: TYPES.NVarChar })
    params.push({ name: `pupilId${i}`, value: o.pupilId, type: TYPES.Int })
  })
  try {
    const result = sqlService.modify(sql.join('\n'), params)
    return result
  } catch (error) {
    context.log.error('execution of sql in updatePupilStatuses failed')
    context.log.error(parseParams(params))
    throw error
  }
}
module.exports = { recalculatePupilStatus }
