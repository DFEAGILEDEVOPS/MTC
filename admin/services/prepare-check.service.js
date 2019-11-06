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
      return {
        key: buildKey(check.schoolPin, check.pupilPin),
        value: constructPreparedCheck(check)
      }
    })
    const ttl = secondsBetweenNowAnd4pm()
    return redisService.setMany(preparedChecks, ttl)
  }
}

function secondsBetweenNowAnd4pm () {
  const a = moment()
  const b = moment().startOf('16:00')
  return a.diff(b, 'seconds')
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
    createdAt: new Date(),
    pinExpiresAt: moment(check.pupil.pinExpiresAt).toDate(),
    pupil: R.omit(['id', 'checkFormAllocationId', 'pinExpiresAt'], check.pupil),
    pupilId: check.pupil.id,
    questions: check.questions,
    school: check.school,
    schoolId: check.school.id,
    tokens: check.tokens,
    updatedAt: new Date()
  }
  return entity
}

function buildKey (schoolPin, pupilPin) {
  return `preparedCheck:${schoolPin}:${pupilPin}`
}

module.exports = service
