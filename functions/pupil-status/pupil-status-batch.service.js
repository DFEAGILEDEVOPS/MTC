'use strict'

const config = require('../config')
const pupilStatusAnalysisService = require('./pupil-status-analysis.service')
const sqlService = require('less-tedious')
const { TYPES } = sqlService
sqlService.initialise(config.Sql)

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
function updatePupilStatuses (updates, context) {
  const sql = []
  const params = []

  updates.forEach((o, i) => {
    sql.push(`UPDATE ${sqlService.adminSchema}.[pupil]
              SET pupilStatus_id = (SELECT id from ${sqlService.adminSchema}.[pupilStatus] WHERE code = @code${i})
              WHERE id = @pupilId${i};`)
    params.push({ name: `code${i}`, value: o.targetStatusCode, type: TYPES.NVarChar })
    params.push({ name: `pupilId${i}`, value: o.pupilId, type: TYPES.Int })
  })
  context.log('updatePupilStatuses is attempting to execute the following sql:')
  context.log(`${sql.join('\n')}`)
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
