'use strict'

const moment = require('moment')
const R = require('ramda')
const redisService = require('./redis-cache.service')

const service = {
  /**
   * @param {[{object}]} checks the pupil checks to prepare
   * @returns {Promise<void>}
   */
  prepareChecks: (checks) => {
    if (!Array.isArray(checks)) {
      throw new Error('checks is not an array')
    }
    const preparedChecks = checks.map(check => {
      const preparedCheck = constructPreparedCheck(check)
      return {
        key: buildKey(check.schoolPin, check.pupilPin),
        value: preparedCheck,
        ttl: secondsBetweenNowAndPinExpiryTime(preparedCheck.pinExpiresAt)
      }
    })
    return redisService.setMany(preparedChecks)
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
 * @return {object}
 */
function constructPreparedCheck (check) {
  const entity = {
    checkCode: check.pupil.checkCode,
    config: check.config,
    createdAt: moment(),
    pinExpiresAt: moment(check.pupil.pinExpiresAt),
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

function buildKey (schoolPin, pupilPin) {
  return `preparedCheck:${schoolPin}:${pupilPin}`
}

module.exports = service
