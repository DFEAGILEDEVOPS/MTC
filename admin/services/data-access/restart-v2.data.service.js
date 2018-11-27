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
