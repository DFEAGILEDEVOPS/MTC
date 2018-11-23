'use strict'

const R = require('ramda')
const sqlService = require('less-tedious')

const config = require('../config')
sqlService.initialise(config)
const azureStorageHelper = require('../lib/azure-storage-helper')

const v1 = {
  process: async function process (logger) {
    // step 1: change the check status
    const checkData = await expireChecks(logger)

    // step 2: update the pupil status
    await updatePupilStatus(logger, checkData)

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
      checkCode uniqueidentifier NOT NULL
  );
      
  UPDATE TOP (500) [mtc_admin].[check]
  SET checkStatus_id = (SELECT TOP (1) id from [mtc_admin].[checkStatus] where code = 'EXP')
  OUTPUT [inserted].id, [inserted].pupil_id, [inserted].[checkCode] INTO @updateLog
  FROM [mtc_admin].[check] chk 
    join [mtc_admin].[checkPin] cp ON (chk.id = cp.check_id)
    join [mtc_admin].[checkStatus] cs ON (chk.checkStatus_id = cs.id)
  WHERE
    cp.pinExpiresAt < GETUTCDATE()
  AND 
    cs.code IN ('NEW', 'COL');
    
  SELECT
       checkId,
       pupilId,
       checkCode
  FROM @updateLog;`

  return sqlService.query(sql)
}

/**
 * Make a request for the pupil-status to be updated for multiple pupils
 * @param checkCode
 * @return {Promise<*|Promise<*>>}
 */
async function updatePupilStatus (logger, checkData) {
  logger.info(`check-expiry: updatePupilStatus(): got ${checkData.length} pupils`)
  // Batch the async messages up, to limit max concurrency
  const batches = R.splitEvery(100, checkData)
  checkData = null

  logger.verbose('check-expiry: updatePupilStatus(): ' + batches.length + ' batches detected')

  batches.forEach(async (checks, batchNumber) => {
    try {
      const msgs = checks.map(check => azureStorageHelper.addMessageToQueue('pupil-status', {
        version: 1,
        pupilId: check.pupilId,
        checkCode: check.checkCode
      }))
      await Promise.all(msgs)
      logger.verbose(`check-expiry: batch ${batchNumber} complete`)
    } catch (error) {
      logger.error(`check-expiry: updatePupilStatus(): ERROR: ${error.message}`)
    }
  })
}

module.exports = v1
