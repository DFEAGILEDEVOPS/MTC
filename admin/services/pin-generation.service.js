const moment = require('moment-timezone')
const bluebird = require('bluebird')
const crypto = bluebird.promisifyAll(require('crypto'))

const config = require('../config')
const dateService = require('../services/date.service')
const groupDataService = require('../services/data-access/group.data.service')
const pinTimestampService = require('../services/pin-timestamp.service')
const logger = require('./log.service').getLogger()
const pinValidator = require('../lib/validator/pin-validator')
const randomGenerator = require('../lib/random-generator')

const allowedWords = new Set(
  (config.Data.allowedWords && config.Data.allowedWords.split(',')) || []
)

const bannedWords = [
  'dim'
]

const fourPmToday = moment().startOf('day').add(16, 'hours')
const endOfDay = moment().endOf('day')

const pinGenerationService = {}
const chars = '23456789'

/**
 * Generate timestamp value based on parameters
 * @param {boolean} overrideEnabled
 * @param {moment} overrideValue
 * @param {moment} defaultValue
 * @param {string} schoolTimezone
 * @return {moment} pinTimestamp
 */

pinGenerationService.generatePinTimestamp = (overrideEnabled, overrideValue, defaultValue, schoolTimezone = null) => {
  let pinTimestamp
  if (overrideEnabled) {
    pinTimestamp = overrideValue
  } else {
    pinTimestamp = defaultValue
  }
  if (schoolTimezone) {
    // needed to parse the date in the specified timezone and convert to utc for storing
    pinTimestamp = moment.tz(dateService.formatIso8601WithoutTimezone(pinTimestamp), schoolTimezone).utc()
  }
  return pinTimestamp
}

/**
 * Find groups that have pupils that can get PINs assigned.
 * @param schoolId
 * @param pupilIds
 * @returns {Promise<*>}
 */
pinGenerationService.filterGroups = async (schoolId, pupilIds) => {
  if (pupilIds.length < 1) return []
  return groupDataService.sqlFindGroupsByIds(schoolId, pupilIds)
}

/**
 * Generate school password
 * @param school
 * @returns { pin: string, pinExpiresAt: Moment } || undefined
 */
pinGenerationService.generateSchoolPassword = school => {
  if (allowedWords.size < 5) {
    throw new Error('Service is incorrectly configured')
  }
  if (pinValidator.isActivePin(school.pin, school.pinExpiresAt)) {
    return undefined
  }

  bannedWords.forEach(word => {
    if (allowedWords.has(word)) {
      allowedWords.delete(word)
      logger.warn(`generateSchoolPassword: removed banned word '${word}' from word-list`)
    }
  })

  const wordsArray = Array.from(allowedWords)
  const firstRandomWord =
    wordsArray[pinGenerationService.generateCryptoRandomNumber(0, wordsArray.length - 1)]
  const secondRandomWord =
    wordsArray[pinGenerationService.generateCryptoRandomNumber(0, wordsArray.length - 1)]
  const numberCombination = randomGenerator.getRandom(2, chars)
  const newPin = `${firstRandomWord}${numberCombination}${secondRandomWord}`
  const newExpiry = pinTimestampService.generatePinTimestamp(config.OverridePinExpiry, endOfDay, fourPmToday, school.timezone)
  return { pin: newPin, pinExpiresAt: newExpiry }
}

/**
 * Generating random numbers in specific range using crypto.randomBytes from crypto library
 * Maximum available range is 281474976710655 or 256^6-1
 * Maximum number for range must be equal or less than Number.MAX_SAFE_INTEGER (usually 9007199254740991)
 * @param minimum - inclusive
 * @param maximum - inclusive
 * @returns {Number}
*/
pinGenerationService.generateCryptoRandomNumber = (minimum, maximum) => {
  const maxDec = 281474976710656
  const randBytes = parseInt(crypto.randomBytes(6).toString('hex'), 16)
  return Math.floor(randBytes / maxDec * (maximum - minimum + 1) + minimum)
}

module.exports = pinGenerationService
