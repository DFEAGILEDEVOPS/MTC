'use strict'

const sqlService = require('../lib/sql/sql.service')
const azureStorageHelper = require('../lib/azure-storage-helper')

const v2 = {
  process: async function process (logger) {
    // Update the check status in the SQL DB
    const checkData = await updateChecksNotReceived()

    // Make requests for pupil status updates
    await azureStorageHelper.updatePupilStatusForLiveChecks(logger, 'check-not-received', checkData)

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
      checkCode uniqueidentifier NOT NULL,
      isLiveCheck bit NOT NULL
    );
    DECLARE @checkTimeLimit int
    SET @checkTimeLimit = (SELECT TOP (1) checkTimeLimit FROM [mtc_admin].settings)
    DECLARE @checkStatusId int
    SET @checkStatusId = (SELECT TOP (1) id FROM [mtc_admin].[checkStatus] WHERE code = 'NTR')
    UPDATE TOP (500) [mtc_admin].[check]
      SET [checkStatus_id] = @checkStatusId
      OUTPUT [inserted].id, [inserted].pupil_id, [inserted].[checkCode], [inserted].[isLiveCheck] INTO @updateLog
      FROM [mtc_admin].[check] chk
              JOIN [mtc_admin].[checkStatus] chkStatus ON (chk.checkStatus_id = chkStatus.id)
      WHERE chkStatus.code = 'STD'
          AND chk.startedAt IS NOT NULL
          AND chk.isLiveCheck = 1
          AND GETDATE() > DATEADD(minute, @checkTimeLimit, chk.startedAt);
                 
    SELECT
       checkId,
       pupilId,
       checkCode,
       isLiveCheck
    FROM @updateLog;`

  return sqlService.query(sql)
}

module.exports = v2
