'use strict'

const sqlService = require('../lib/sql/sql.service')
const { TYPES } = sqlService
const azureStorageHelper = require('../lib/azure-storage-helper')

const v2 = {
  process: async function process (logger) {
    // change the check status
    const checkData = await expireChecks(logger)

    // if we have just expired a restart check we need to also remove the pupilRestart.check_id
    // field as the check it refers to was never taken.
    await expireRestarts(checkData)

    // finally, update the pupil status
    await azureStorageHelper.updatePupilStatusForLiveChecks(logger, 'check-expiry', checkData)

    return {
      processCount: checkData.length
    }
  }
}

/**
 * Find expired checks and set the status accordingly
 * Returns a minimal check object for each check expired
 * @return {Promise}
 */
async function expireChecks () {
  const sql = `
  DECLARE @updateLog table (
      checkId int NOT NULL,
      pupilId int NOT NULL,
      checkCode uniqueidentifier NOT NULL,
      isLiveCheck bit NOT NULL
  );

  UPDATE TOP (500) [mtc_admin].[check]
  SET checkStatus_id = (SELECT TOP (1) id from [mtc_admin].[checkStatus] where code = 'EXP')
  OUTPUT [inserted].id, [inserted].pupil_id, [inserted].[checkCode], [inserted].[isLiveCheck] INTO @updateLog
  FROM [mtc_admin].[check] chk
    join [mtc_admin].[checkPin] cp ON (chk.id = cp.check_id)
    join [mtc_admin].[checkStatus] cs ON (chk.checkStatus_id = cs.id)
  WHERE
    cp.pinExpiresAt < GETUTCDATE()
  AND
  (cs.code IN ('NEW', 'COL') OR (cs.code = 'STD' AND chk.isLiveCheck=0));

  SELECT
       checkId,
       pupilId,
       checkCode,
       isLiveCheck
  FROM @updateLog;`

  return sqlService.query(sql)
}

async function sqlFindPupilRestarts (checkIds) {
  if (!Array.isArray(checkIds)) {
    checkIds = []
  }
  if (checkIds.length === 0) {
    return
  }
  const select = `SELECT *
                    FROM [mtc_admin].[pupilRestart]
                    WHERE isDeleted = 0
                      AND check_id IN`
  const { params, paramIdentifiers } = sqlService.buildParameterList(checkIds, TYPES.Int)
  const sql = [select, '(', paramIdentifiers.join(', '), ')'].join(' ')
  return sqlService.query(sql, params)
}

async function sqlClearCheckIdField (pupilRestartIds) {
  if (!Array.isArray(pupilRestartIds)) {
    pupilRestartIds = []
  }
  if (pupilRestartIds.length === 0) {
    return
  }
  const update = `UPDATE [mtc_admin].[pupilRestart] SET check_id = null`
  const { params, paramIdentifiers } = sqlService.buildParameterList(pupilRestartIds, TYPES.Int)
  const sql = [update, 'WHERE id IN (', paramIdentifiers.join(', '), ')'].join(' ')
  return sqlService.modify(sql, params)
}

async function expireRestarts (checkData) {
  // Find any restarts in the checks that just got expired
  const checkIds = checkData.map(c => c.checkId)
  const pupilRestarts = await sqlFindPupilRestarts(checkIds)
  if (!pupilRestarts) {
    return
  }

  const pupilRestartIds = pupilRestarts.map(p => p.id)

  // Clear the `check_id` fields of the pupil restarts, so they can generate another pin
  if (pupilRestartIds.length > 0) {
    await sqlClearCheckIdField(pupilRestartIds)
  }
}

module.exports = v2
