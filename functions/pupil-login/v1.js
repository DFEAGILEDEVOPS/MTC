'use strict'

const sqlService = require('../lib/sql/sql.service')
const { TYPES } = sqlService
const azureStorageHelper = require('../lib/azure-storage-helper')
const sqlHelper = require('../lib/sql-helper')

const v1 = {
  /**
   * Update the SQL DB with the pupil login datetime
   * Message originates from the pupil-api
   * @param {string} checkCode - check GUID
   * @param {string} loginDatetime - string Datetime
   * @return {Promise<void>}
   */
  sqlUpdateLoginTimestampAndCheckStatus: async function sqlUpdateLoginTimestampAndCheckStatus (checkCode, loginDatetime) {
    const loginDate = new Date(loginDatetime)
    const sql = `UPDATE [mtc_admin].[check]
               SET pupilLoginDate = @loginDate,
                   checkStatus_id = (SELECT TOP 1 id FROM [mtc_admin].[checkStatus]
                                    WHERE code = 'COL')
               WHERE checkCode = @checkCode`
    const params = [
      { name: 'loginDate', value: loginDate, type: TYPES.DateTimeOffset },
      { name: 'checkCode', value: checkCode, type: TYPES.UniqueIdentifier }
    ]

    sqlService.modify(sql, params)
  },

  process: async function process (message) {
    await this.sqlUpdateLoginTimestampAndCheckStatus(message.checkCode, message.loginAt)

    // Once the Check Status is updated we can request a pupil status update
    // we need to find the pupilId
    const check = await sqlHelper.sqlFindCheckByCheckCode(message.checkCode)

    await azureStorageHelper.addMessageToQueue('pupil-status', {
      version: 1,
      checkCode: message.checkCode.toUpperCase(),
      pupilId: check.pupil_id
    })
  }
}

module.exports = v1
