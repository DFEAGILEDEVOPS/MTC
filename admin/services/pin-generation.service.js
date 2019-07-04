const moment = require('moment-timezone')
const bluebird = require('bluebird')
const R = require('ramda')
const crypto = bluebird.promisifyAll(require('crypto'))
const pupilDataService = require('../services/data-access/pupil.data.service')
const checkDataService = require('../services/data-access/check.data.service')
const groupDataService = require('../services/data-access/group.data.service')
const dateService = require('../services/date.service')
const randomGenerator = require('../lib/random-generator')
const pinValidator = require('../lib/validator/pin-validator')
const pupilAttendanceService = require('../services/attendance.service')
const pupilIdentificationFlagService = require('../services/pupil-identification-flag.service')
const restartService = require('../services/restart.service')
const config = require('../config')
const logger = require('./log.service').getLogger()

const allowedWords = new Set(
  (config.Data.allowedWords && config.Data.allowedWords.split(',')) || []
)

const bannedWords = [
  'dim'
]

const fourPmToday = () => moment().startOf('day').add(16, 'hours')

const pinExpiryTime = (schoolTimezone = null) => {
  let toReturn
  if (config.OverridePinExpiry) {
    toReturn = moment().endOf('day')
  } else {
    toReturn = fourPmToday()
  }
  if (schoolTimezone) {
    // needed to parse the date in the specified timezone and convert to utc for storing
    toReturn = moment.tz(dateService.formatIso8601WithoutTimezone(toReturn), schoolTimezone).utc()
  }
  return toReturn
}

const pinGenerationService = {}
const chars = '23456789'

/**
 * Get the expiry time for a pin
 *
 */
pinGenerationService.getPinExpiryTime = pinExpiryTime

/**
 * Fetch pupils and filter required only pupil attributes
 * @param schoolId
 * @returns {Array}
 */
pinGenerationService.getPupils = async (schoolId, pinEnv) => {
  let pupils = await pupilDataService.sqlFindPupilsBySchoolID(schoolId)
  pupils = await Promise.all(
    pupils.map(async p => {
      const isValid = await pinGenerationService.isValid(p, pinEnv)
      if (isValid) {
        return {
          id: p.id,
          pin: p.pin,
          group_id: p.group_id,
          dateOfBirth: p.dateOfBirth,
          foreName: p.foreName,
          lastName: p.lastName,
          fullName: `${p.lastName}, ${p.foreName}`,
          middleNames: p.middleNames
        }
      }
    })
  )
  pupils = pupils.filter(p => !!p)
  if (pupils.length === 0) return []
  // determine if more than one pupil has same full name
  pupils = pupilIdentificationFlagService.addIdentificationFlags(pupils)
  return pupils
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
 * Determine if pupil is valid for pin generation
 * @param p
 * @returns {Boolean}
 */
pinGenerationService.isValid = async (p, pinEnv = 'live') => {
  const checkCount = await checkDataService.sqlFindNumberOfChecksStartedByPupil(
    p.id
  )
  const hasAttendance = await pupilAttendanceService.hasAttendance(p.id, pinEnv)
  if (checkCount === restartService.totalChecksAllowed) return false
  const canRestart = await restartService.canRestart(p.id)
  const hasValidPin = pinValidator.isActivePin(p.pin, p.pinExpiresAt)
  // TODO: use pinEnv to differentiate between live and familiarisation checks
  return pinEnv === 'live'
    ? !hasValidPin && !hasAttendance && !canRestart
    : !hasValidPin && !hasAttendance
}

/**
 * Generate pupils pins for a specific pin env (live/fam)
 * @param pupilsList
 * @param dfeNumber
 * @param maxAttempts
 * @param attemptsRemaining
 * @param schoolId
 * @param pinEnv
 * @throws
 */
pinGenerationService.updatePupilPins = async (
  pupilsList,
  dfeNumber,
  maxAttempts,
  attemptsRemaining,
  schoolId,
  pinEnv
) => {
  if (!Array.isArray(pupilsList)) {
    throw new Error('Received list of pupils is not an array')
  }
  if (!schoolId) {
    throw new Error('Parameter `schoolId` not provided', schoolId)
  }

  let ids = Object.values(pupilsList || null)
  ids = ids.map(i => parseInt(i))
  const pupils = await pupilDataService.sqlFindByIds(ids, schoolId)
  pupils.forEach(pupil => {
    if (!pinValidator.isActivePin(pupil.pin, pupil.pinExpiresAt)) {
      pupil.pin = pinGenerationService.generatePupilPin()
      pupil.pinExpiresAt = pinExpiryTime()
    }
  })
  const data = pupils.map(p => ({
    id: p.id,
    pin: p.pin,
    pinExpiresAt: p.pinExpiresAt
  }))
  try {
    await pupilDataService.sqlUpdatePinsBatch(data, pinEnv)
  } catch (error) {
    if (attemptsRemaining === 0) {
      throw new Error(
        `${maxAttempts} allowed attempts 
      for pin generation resubmission have been reached`
      )
    }
    // Handle duplicate pins
    if (error.number === 2601 && attemptsRemaining !== 0) {
      attemptsRemaining -= 1
      const pupilsWithActivePins = await pupilDataService.sqlFindPupilsWithActivePins(
        schoolId
      )
      const pupilIdsWithActivePins = pupilsWithActivePins.map(p => p.id)
      const pendingPupilIds = R.difference(ids, pupilIdsWithActivePins)
      await pinGenerationService.updatePupilPins(
        pendingPupilIds,
        dfeNumber,
        maxAttempts,
        attemptsRemaining,
        schoolId,
        pinEnv
      )
    } else {
      throw new Error(error)
    }
  }
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
    wordsArray[ pinGenerationService.generateCryptoRandomNumber(0, wordsArray.length - 1) ]
  const secondRandomWord =
    wordsArray[ pinGenerationService.generateCryptoRandomNumber(0, wordsArray.length - 1) ]
  const numberCombination = randomGenerator.getRandom(2, chars)
  const newPin = `${firstRandomWord}${numberCombination}${secondRandomWord}`
  const newExpiry = pinExpiryTime(school.timezone)
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

/**
 * Generate Pupil Pin
 * @returns {String}
 */
pinGenerationService.generatePupilPin = () => {
  const pupilPinLength = 4
  return randomGenerator.getRandom(pupilPinLength, chars)
}

module.exports = pinGenerationService
