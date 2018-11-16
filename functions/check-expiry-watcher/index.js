'use strict'

const sqlService = require('less-tedious')
const azureStorageHelper = require('../lib/azure-storage-helper')
const { performance } = require('perf_hooks')

/**
 * Find Checks that have expired - and submit them to the check-expiry queue to be expired
 * NB: Azure may terminate a function anytime after 5 mins
 * @param context
 * @param myTimer
 * @return {Promise<void>}
 */

module.exports = async function (context, myTimer) {
  const start = performance.now()
  const expiredChecks = await findExpiredChecks()

  const promises = []
  for (let check of expiredChecks) {
    promises.push(azureStorageHelper.addMessageToQueue('check-expiry', {
      version: 1,
      checkCode: check.checkCode
    }))
  }

  try {
    await Promise.all(promises)
  } catch (error) {
    context.log.error(`check-expiry-watcher: failed to submit 1 or more check-expiry message to the queue. Reason was: ${error.message}`)
  }

  const timeStamp = new Date().toISOString()
  const end = performance.now()
  const durationInMilliseconds = (end - start)
  context.log(`check-expiry-watcher: ${timeStamp}: run complete: processed ${expiredChecks.length} checks in ${durationInMilliseconds} ms`)
}

/**
 * Find all checks that have expired PINS - that are not yet in a end-status (EXPIRED, COMPLETE or CHECK_NOT_RECEIVED)
 * @return {Promise<*>}
 */
async function findExpiredChecks() {
    const sql = `SELECT TOP(5000) 
                    chk.id,
                    chk.checkCode
               FROM [mtc_admin].[checkPin] cp
                  JOIN [mtc_admin].[check] chk ON (cp.check_id = chk.id)
                  JOIN [mtc_admin].[checkStatus] cs ON (chk.checkStatus_id = cs.id)
               WHERE pinExpiresAt < GETUTCDATE()
               AND cs.code IN ('NEW', 'COL')`
    return sqlService.query(sql)
}

/**
 * Find all checks that were started more than x minutes ago (e.g. 30 mins) so we can mark the check as not received.
 * @return {Promise<*>}
 */
async function findIncompleteChecks() {
  const sql = `SELECT chk.id 
               FROM [mtc_admin].[check] chk
                  JOIN [mtc_admin].[checkStatus] chkStatus ON (chk.checkStatus_id = chkStatus.id)
               WHERE chkStatus.code = 'STD'
               AND chk.startedAt IS NOT NULL
               AND chk.startedAt < DATEADD(minute, 1, chk.startedAt)`

  return sqlService.query(sql)
}