'use strict'

const { TYPES } = require('tedious')

const sqlService = require('./sql.service')
const config = require('../../config')

module.exports.sqlFindPupilsEligibleForRestart = async function sqlFindPupilsEligibleForRestart (schoolId) {
  const sql = `SELECT *
               FROM   [mtc_admin].[vewPupilsEligibleForRestart]
               WHERE  school_id = @schoolId
               AND    totalCheckCount <= (@maxRestartsAllowed + 1)`

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
