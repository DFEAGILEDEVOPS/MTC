'use strict'
const { flatten } = require('ramda')

const { TYPES } = require('./sql.service')
const sqlService = require('./sql.service')
const config = require('../../config')

module.exports.sqlFindPupilsEligibleForRestart = async function sqlFindPupilsEligibleForRestart (schoolId) {
  const sql = `SELECT *
               FROM   [mtc_admin].[vewPupilsEligibleForRestart]
               WHERE  school_id = @schoolId
               AND    totalCheckCount < (@maxRestartsAllowed + 1)`

  const params = [
    {
      name: 'schoolId',
      value: schoolId,
      type: TYPES.Int
    },
    {
      name: 'maxRestartsAllowed',
      value: config.RESTART_MAX_ATTEMPTS,
      type: TYPES.Int
    }
  ]

  return sqlService.query(sql, params)
}

module.exports.getRestartsForSchool = async function getRestartsForSchool (schoolId) {
  const sql = `
    SELECT
           pr.id,
           p.id as pupilId,
           rr.code as restartReasonCode,
           rr.description as reason,
           p.foreName,
           p.lastName,
           p.middleNames,
           p.dateOfBirth,
           p.urlSlug,
           pr.check_id as restartCheckAllocation,
           vct.totalCheckCount,
           cs.code
    FROM
           (
              SELECT *,
              ROW_NUMBER() OVER (PARTITION BY pupil_id ORDER BY id DESC) as rank
              FROM [mtc_admin].[pupilRestart]
              WHERE isDeleted = 0
           )  pr join
           [mtc_admin].[pupil] p ON (pr.pupil_id = p.id) join
           [mtc_admin].[pupilRestartReason] rr ON (pr.pupilRestartReason_id = rr.id) left join
           [mtc_admin].[check] c ON (pr.check_id = c.id) left join
           [mtc_admin].[checkStatus] cs ON (c.checkStatus_id = cs.id) left join
           [mtc_admin].[vewPupilLiveChecksTakenCount] vct ON (p.id = vct.pupil_id)
    WHERE
           pr.rank = 1
    AND    p.school_id = @schoolId
    ORDER BY
           p.lastName, p.foreName, p.middleNames, p.dateOfBirth;
  `

  const params = [
    { name: 'schoolId', value: schoolId, type: TYPES.Int }
  ]

  return sqlService.query(sql, params)
}

/**
 * Allow a restart for a list of pupils
 * @param {Object[]} restartData
 * @param {number} restartData.currentCheckId
 * @param {number} restartData.pupil_id
 * @param {string} restartData.recordedByUser_id
 * @param {string} restartData.pupilRestartReasonCode
 * @param {string} restartData.classDisruptionInformation
 * @param {string} restartData.didNotCompleteInformation
 * @param {string} restartData.furtherInformation
 * @return {Promise<*>}
 */
module.exports.restartTransactionForPupils = async function restartTransactionForPupils (restartData) {
  /**
   * Notes
   *
   * For each pupil
   * 1. CheckPin table: Expire the pins used for live checks if there is one
   * 2. Check table: Void the existing live check if there is one: checkStatus => VOID
   * 2. Pupil Restart table: Add the restart record
   * 3. (in another service: remove the preparedCheck from (redis|table storage)
   * 4. Pupil table: Update the pupil with the restartAvailable flag, ensure the checkComplete flag is false,
   *    unset the currentCheckId field
   */

  const { params: checkParams, paramIdentifiers: checkParamIdentifiers } = sqlService.buildParameterList(
    restartData.map(r => r.currentCheckId),
    TYPES.Int,
    'check'
  )

  const { params: pupilParams, paramIdentifiers: pupilIdentifiers } = sqlService.buildParameterList(
    restartData.map(p => p.pupil_id),
    TYPES.Int,
    'pupil'
  )

  const pupilRestartData = restartData.map((d, idx) => {
    const params = [
      { name: `cd${idx}`, value: d.classDisruptionInformation, type: TYPES.NVarChar },
      { name: `dnc${idx}`, value: d.didNotCompleteInformation, type: TYPES.NVarChar },
      { name: `fi${idx}`, value: d.furtherInformation, type: TYPES.NVarChar },
      { name: `pid${idx}`, value: d.pupil_id, type: TYPES.Int },
      { name: `prrCode${idx}`, value: d.pupilRestartReasonCode, type: TYPES.Char },
      { name: `rbu${idx}`, value: d.recordedByUser_id, type: TYPES.Int }
    ]

    const sql = `INSERT INTO [mtc_admin].[pupilRestart] (
                classDisruptionInformation, 
                didNotCompleteInformation, 
                furtherInformation, 
                pupil_id, 
                pupilRestartReason_id, 
                recordedByUser_id
           ) VALUES (
                @cd${idx},
                @dnc${idx}, 
                @fi${idx}, 
                @pid${idx}, 
                (SELECT id from [mtc_admin].[pupilRestartReason] where code = @prrCode${idx}), 
                @rbu${idx}
            );`

    return {
      sql, params
    }
  })

  const pupilRestartSqls = pupilRestartData.map(p => p.sql)
  const pupilRestartParams = flatten(pupilRestartData.map(p => p.params)) // requires node 11 for Array.flatMap

  const sql = `
     DELETE FROM [mtc_admin].[checkPin] WHERE check_id IN (${checkParamIdentifiers.join(', ')});
     
     UPDATE [mtc_admin].[check] 
        SET checkStatus_id = (SELECT TOP 1 id FROM [mtc_admin].[checkStatus] WHERE CODE = 'VOD') 
        WHERE id IN (${checkParamIdentifiers.join(', ')});
     
     ${pupilRestartSqls.join('\n')}
    
     UPDATE [mtc_admin].[pupil] 
        SET restartAvailable = 1, checkComplete = 0, currentCheckId = NULL
        WHERE id IN (${pupilIdentifiers.join(', ')});
     
     SELECT id, urlSlug FROM [mtc_admin].[pupil] where id in (${pupilIdentifiers.join(', ')});
  `

  const allParams = checkParams.concat(pupilRestartParams).concat(pupilParams)
  const res = await sqlService.modifyWithTransactionAndResponse(sql, allParams)
  return Array.isArray(res.response) ? res.response : []
}

/**
 * Retrieve live check data from an array of pupil ids
 * @param { number[] } pupilsList
 * @return { Promise<{checkId: number, pupilId: number, pupilPin: number, schoolPin: string}[]> }
 */
module.exports.getLiveCheckDataByPupilId = async function getLiveCheckDataByPupilId (pupilsList) {
  console.log('getLiveCheckDataByPupilId.pupilsList', pupilsList)
  const { params, paramIdentifiers } = sqlService.buildParameterList(pupilsList, TYPES.Int)
  const sql = `
    select 
      c.id as checkId,
      pp.id as pupilId,
      p.val as pupilPin,
      s.pin as schoolPin
    from 
        [mtc_admin].[pupil] pp JOIN 
        [mtc_admin].[school] s ON (pp.school_id = s.id) JOIN 
        [mtc_admin].[check] c ON (pp.currentCheckId = c.id) JOIN 
        [mtc_admin].[checkPin] cp ON (c.id = cp.check_id) JOIN
        [mtc_admin].[pin] p on (cp.pin_id = p.id)
    where
        pp.id IN (${paramIdentifiers.join(', ')})
  `
  return sqlService.query(sql, params)
}
