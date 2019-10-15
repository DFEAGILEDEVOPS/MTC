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
  New: { code: 'NEW' },
  Expired: { code: 'EXP' },
  Complete: { code: 'CMP' },
  Started: { code: 'STD' },
  Collected: { code: 'COL' }
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
