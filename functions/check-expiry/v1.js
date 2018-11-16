'use strict'

const sqlService = require('less-tedious')
const { TYPES } = require('tedious')

const sqlUtil = require('../lib/sql-helper')
const azureStorageHelper = require('../lib/azure-storage-helper')

const v1 = {
  process: async function process(message, logger) {
    // step 1: change the check status - B0
    await expireCheck(message.checkCode)
    // step 2: delete from the prepared check table - A1
    await deleteFromPreparedCheckTable(message.checkCode, logger)
    // step 3: update the pupil status - B1
    await updatePupilStatus(message.checkCode)
  }
}

/**
 * Set the check status to Expired for a single check
 * @param checkCode
 * @return {Promise}
 */
async function expireCheck(checkCode) {
  const sql = `UPDATE [mtc_admin].[check]
               SET checkStatus_id = (SELECT TOP (1) id FROM [mtc_admin].[checkStatus] WHERE code = 'EXP')
               WHERE checkCode = @checkCode`
  const params = [
    { name: 'checkCode', value: checkCode, type: TYPES.UniqueIdentifier }
  ]
  return sqlService.modify(sql, params)
}

/**
 * Delete an entry in the preparedCheck table
 * @param checkCode
 * @param logger
 * @return {Promise<*|Promise<void>>}
 */
async function deleteFromPreparedCheckTable(checkCode, logger) {
  const azureTableService = azureStorageHelper.getPromisifiedAzureTableService()
  try {
    await azureStorageHelper.deleteFromPreparedCheckTableStorage(azureTableService, checkCode, logger)
  } catch (error) {
  }
}

/**
 * Make a request for the pupil-status to be updated
 * @param checkCode
 * @return {Promise<*|Promise<*>>}
 */
async function updatePupilStatus(checkCode) {
  const check = await sqlUtil.sqlFindCheckByCheckCode(checkCode)
  return azureStorageHelper.addMessageToQueue('pupil-status', {
    version: 1,
    pupilId: check.pupil_id,
    checkCode: check.checkCode
  })
}

module.exports = v1