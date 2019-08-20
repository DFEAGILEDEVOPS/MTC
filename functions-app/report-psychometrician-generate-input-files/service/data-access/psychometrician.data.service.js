'use strict'
// const csv = require('fast-csv')
// const fs = require('fs-extra')

// const sqlService = require('../../../lib/sql/sql.service')
// const { TYPES } = sqlService
const base = require('../../../lib/logger')

const psychometricianDataService = {
  // sqlFindCompletedChecksByIds: async function sqlFindCompletedChecksByIds (batchIds) {
  //   let select = `
  //     SELECT
  //     chk.*,
  //     cr.payload,
  //     cs.code,
  //     cs.description,
  //     prr.code restartCode,
  //     (
  //       SELECT COUNT(id)
  //       FROM [mtc_admin].[pupilRestart] pr
  //       WHERE pr.pupil_id = chk.pupil_id
  //       AND pr.createdAt < chk.createdAt
  //       AND pr.isDeleted = 0
  //     ) restartCount,
  //     ac.code attendanceCode
  //     FROM [mtc_admin].[check] chk
  //         LEFT JOIN [mtc_admin].[checkResult] cr ON (chk.id = cr.check_id)
  //         LEFT JOIN [mtc_admin].[pupilRestart] pr ON (pr.check_id = chk.id AND pr.isDeleted = 0)
  //         LEFT JOIN [mtc_admin].[pupilRestartReason] prr ON (prr.id = pr.pupilRestartReason_id)
  //         LEFT JOIN [mtc_admin].[pupilAttendance] pa ON (pa.pupil_id = chk.pupil_id AND pa.isDeleted = 0)
  //         LEFT JOIN [mtc_admin].[attendanceCode] ac ON (ac.id = pa.attendanceCode_id AND pa.isDeleted = 0)
  //         JOIN [mtc_admin].[checkStatus] cs ON (chk.checkStatus_id = cs.id)`
  //   const where = sqlService.buildParameterList(batchIds, TYPES.Int)
  //   const sql = [select, 'WHERE chk.id IN (', where.paramIdentifiers.join(', '), ')'].join(' ')
  //   // Populate the JSON data structure which is stored as a string in the SQL DB
  //   const results = await sqlService.query(sql, where.params)
  //   const parsed = results.map(x => {
  //     if (!x.payload) {
  //       return R.clone(x)
  //     }
  //     const parsedPayload = JSON.parse(x.payload)
  //     return R.assoc('data', parsedPayload, R.omit(['payload'], x))
  //   })
  //   return parsed
  // }
}

module.exports = Object.assign(psychometricianDataService, base)
