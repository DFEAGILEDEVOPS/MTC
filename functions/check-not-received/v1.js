'use strict'

const sqlService = require('less-tedious')
const { TYPES } = require('tedious')
const config = require('../config')
sqlService.initialise(config)
const azureStorageHelper = require('../lib/azure-storage-helper')

const v1 = {
  process: async function process (logger) {
    // Update the check status in the SQL DB
    const checkData = await updateChecksNotReceived()

    // Make requests for pupil status updates
    await azureStorageHelper.updatePupilStatus(logger, 'check-not-received', checkData)

    return {
      checksUpdated: checkData.length
    }
  }
}

/**
 * Set the check status to CHECK_NOT_RECEIVED for zero or more checks if the check is late
 * Return the updated checkIds and pupilIds
 * @return {Promise}
 */
async function updateChecksNotReceived () {
  const sql = `
    DECLARE @updateLog table (
      checkId int NOT NULL,
      pupilId int NOT NULL,
      checkCode uniqueidentifier NOT NULL
    );

  UPDATE TOP (500) [mtc_admin].[check]
      SET [checkStatus_id] = (SELECT TOP (1) id FROM [mtc_admin].[checkStatus] WHERE code = 'NTR')       
      OUTPUT [inserted].id, [inserted].pupil_id, [inserted].[checkCode] INTO @updateLog       
      FROM [mtc_admin].[check] chk
              JOIN [mtc_admin].[checkStatus] chkStatus ON (chk.checkStatus_id = chkStatus.id)       
      WHERE chkStatus.code = 'STD'
          AND chk.startedAt IS NOT NULL
          AND chk.isLiveCheck = 1
          AND chk.startedAt < DATEADD(minute, @maxCheckAge, chk.startedAt);
                 
    SELECT
       checkId,
       pupilId,
       checkCode
    FROM @updateLog;`

  const params = [
    { name: 'maxCheckAge', value: +config.maximumCheckAgeInMinutes, type: TYPES.Int }
  ]

  return sqlService.query(sql, params)
}

module.exports = v1
