'use strict'

const checkDataService = require('./data-access/check.data.service')
const checkStatusDataService = require('./data-access/check-status.data.service')

/**
 * Constants for use by callers
 * @type {Readonly<{New: string, Expired: string, Complete: string, Started: string, Collected: string}>}
 */
module.exports.States = Object.freeze({
  New: 'New',
  Expired: 'Expired',
  Complete: 'Complete',
  Started: 'Started',
  Collected: 'Collected'
})

/**
 * CheckStatus Codes
 */
const checkStatusCodes = Object.freeze({
  Collected: { code: 'COL' },
  Complete: { code: 'CMP' },
  Expired: { code: 'EXP' },
  New: { code: 'NEW' },
  NotReceived: { code: 'NTR' },
  Started: { code: 'STD' },
  Void: { code: 'VOD' }
})

/**
 * Change the state of a check
 * @param {string} checkCode
 * @param {string} newState  New | Expired | Complete | Started | Collected
 */
module.exports.changeState = async function changeState (checkCode, newState) {
  if (!checkStatusCodes[newState]) {
    throw new Error(`Invalid checkStatus code: [${newState}]`)
  }
  const check = await checkDataService.sqlFindOneByCheckCode(checkCode)
  const newStatus = await checkStatusDataService.sqlFindOneByCode(checkStatusCodes[newState].code)

  // TODO: Add state-change business logic

  const update = {
    id: check.id,
    checkStatus_id: newStatus.id
  }

  await checkDataService.sqlUpdate(update)
}

// /**
//  * Impure function
//  * @param checkId
//  * @return {Promise<checkStatusCodes.New|{code}|checkStatusCodes.Collected|checkStatusCodes.Started|checkStatusCodes.NotReceived|checkStatusCodes.Expired|*>}
//  */
// module.exports.calculateCheckStatus = async function calculateCheckStatus (checkId) {
//   const check = await checkDataService.getCheckDataForStateCalc(checkId)
//   const settings = await settingService.get()
//   const now = moment()
//   let status
//
//   /**
//    * CAST LIST
//    * ~~~~~~~~~
//    * NOW()
//    * settings.checkTimeLimit
//    * check.pupilLoginDate
//    * check.pinExpiresAt
//    * check.complete
//    * check.startedAt
//    * check.receivedByServerAt
//    * check.payload
//    */
//
//   if (!check.pupilLoginDate && !check.startedAt && !check.complete && check.pinExpiresAt &&
//     moment.isMoment(check.pinExpiresAt) && check.pinExpiresAt.isAfter(now)) {
//     status = checkStatusCodes.New
//   }
//
//   if (check.pupilLoginDate) {
//     status = checkStatusCodes.Collected
//   }
//
//   if (check.startedAt) {
//     status = checkStatusCodes.Started
//     if (moment.isMoment(check.startedAt)) {
//       const expiry = check.startedAt.add(settings.checkTimeLimit, 'minutes')
//       if (now.isAfter(expiry)) {
//         status = checkStatusCodes.NotReceived
//       }
//     }
//   }
//
//   if (check.pupilLoginDate && !check.startedAt && !check.complete &&
//     (check.pinExpiresAt && moment.isMoment(check.pinExpiresAt) && check.pinExpiresAt.isBefore(now)) || !check.pinExpiresAt) {
//     status = checkStatusCodes.Expired
//   }
//
//   if (check.receivedByServerAt && check.complete && check.payload.length > 0) {
//     status = checkStatusCodes.Complete
//   }
//
//   return status
// }
