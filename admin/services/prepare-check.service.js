'use strict'

const moment = require('moment')
const R = require('ramda')

const config = require('../config')
const logger = require('./log.service').getLogger()
const pinService = require('./pin.service')
const prepareCheckDataService = require('./data-access/prepare-check.data.service')
const redisCacheService = require('./data-access/redis-cache.service')
const redisKeyService = require('./redis-key.service')
const redisService = require('./data-access/redis-cache.service')
const { PupilFrozenService } = require('./pupil-frozen.service/pupil-frozen.service')

/**
 * Unprepared Check
 * @typedef {Object} UnpreparedCheck
 * @property {string} checkCode
 * @property {Pupil} pupil
 * @property {number} pupilPin
 * @property {string} schoolPin
 */

/**
* @typedef {Object} Pupil
* @property {string} uuid
* @property {number} id
*/

const service = {
  /**
   * Create the prepared Check and store it in Redis for login at scale
   * @param {Array<UnpreparedCheck>} checks the pupil checks to prepare
   * @param {string} schoolTimezone
   * @returns {Promise<void>}
   */
  prepareChecks: async (checks, schoolTimezone) => {
    if (!Array.isArray(checks)) {
      throw new Error('checks is not an array')
    }
    const pupilIds = checks.map(c => {
      return c.pupil.id
    })
    await PupilFrozenService.throwIfFrozenByIds(pupilIds)
    const lookupKeys = []
    const cacheItems = checks.map(check => {
      const preparedCheck = constructPreparedCheck(check, schoolTimezone)
      const preparedCheckKey = redisKeyService.getPreparedCheckKey(check.schoolPin, check.pupilPin)
      const ttl = secondsBetweenNowAndPinExpiryTime(preparedCheck.pinExpiresAtUtc)
      lookupKeys.push({
        key: redisKeyService.getPreparedCheckLookup(check.checkCode),
        value: preparedCheckKey,
        ttl
      })
      lookupKeys.push({
        key: redisKeyService.getPupilUuidLookupKey(check.checkCode),
        value: check.pupil.uuid,
        ttl
      })
      return {
        key: preparedCheckKey,
        value: preparedCheck,
        ttl
      }
    })
    cacheItems.push(...lookupKeys)
    return redisService.setMany(cacheItems)
  },

  /**
   * Remove prepared checks from redis
   * @param {Number[]} checks - array of check.id's
   * @return {Promise<*>}
   */
  dropChecksFromCache: async function removeChecks (checks) {
    if (!Array.isArray(checks)) {
      throw new Error('checks is not an array')
    }
    if (checks.length <= 0) {
      // there are no preparedChecks outstanding, e.g the checkPin has already been deleted from the DB
      return
    }
    logger.info(`prepareCheckService:removeChecks called for ${checks.join(', ')}`)
    const checkCodes = await prepareCheckDataService.getCheckCodes(checks)
    const secondaryKeys = checkCodes.map(checkCode => redisKeyService.getPreparedCheckLookup(checkCode))
    const primaryKeys = await redisCacheService.getMany(secondaryKeys)
    const result = await redisCacheService.drop(primaryKeys.concat(secondaryKeys))
    return result
  }
}

/**
 *
 * @param {moment.Moment} pinExpiry
 * @returns {number} number of seconds between now and the pin expiry time
 */
function secondsBetweenNowAndPinExpiryTime (pinExpiry) {
  const now = moment()
  const differenceInSeconds = pinExpiry.diff(now, 'seconds')
  return differenceInSeconds
}

/**
 * Return an entity suitable for inserting into the `preparedCheck` table
 * @param {object} check
 * @param {string} schoolTimezone
 * @return {object}
 */
function constructPreparedCheck (check, schoolTimezone) {
  const pinValidFromUtc = pinService.generatePinValidFromTimestamp(config.OverridePinValidFrom, schoolTimezone)
  const entity = {
    checkCode: check.pupil.checkCode,
    config: check.config,
    createdAt: moment(),
    pinExpiresAtUtc: moment(check.pupil.pinExpiresAt),
    pinValidFromUtc,
    pupil: R.omit(['id', 'checkFormAllocationId', 'pinExpiresAt'], check.pupil),
    pupilId: check.pupil.id,
    questions: check.questions,
    school: check.school,
    schoolId: check.school.id,
    tokens: check.tokens,
    updatedAt: moment()
  }
  return entity
}

module.exports = service
