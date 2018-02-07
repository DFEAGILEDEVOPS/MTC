const moment = require('moment')
const bluebird = require('bluebird')
const R = require('ramda')
const crypto = bluebird.promisifyAll(require('crypto'))
const pupilDataService = require('../services/data-access/pupil.data.service')
const checkDataService = require('../services/data-access/check.data.service')
const groupDataService = require('../services/data-access/group.data.service')
const pupilAttendanceDataService = require('../services/data-access/pupil-attendance.data.service')
const randomGenerator = require('../lib/random-generator')
const pinValidator = require('../lib/validator/pin-validator')
const pupilIdentificationFlagService = require('../services/pupil-identification-flag.service')
const restartService = require('../services/restart.service')
const dateService = require('../services/date.service')
const config = require('../config')

const allowedWords = new Set((config.Data.allowedWords && config.Data.allowedWords.split(',')) || [])

const fourPmToday = moment().startOf('day').add(16, 'hours')

const pinExpiryTime = () => {
  if (config.OverridePinExpiry === 'true') {
    return moment().endOf('day')
  }
  return fourPmToday
}

const pinGenerationService = {
  pinSubmissionMaxAttempts: config.Data.pinSubmissionMaxAttempts,
  pinSubmissionAttempts: 0
}
const chars = '23456789'

/**
 * Fetch pupils and filter required only pupil attributes
 * @param dfeNumber
 * @param sortField
 * @param sortDirection
 * @returns {Array}
 */
pinGenerationService.getPupils = async (dfeNumber, sortField, sortDirection) => {
  let pupils = await pupilDataService.sqlFindPupilsByDfeNumber(dfeNumber, sortDirection, sortField)
  pupils = await Promise.all(pupils.map(async p => {
    const isValid = await pinGenerationService.isValid(p)
    if (isValid) {
      return {
        id: p.id,
        pin: p.pin,
        group_id: p.group_id,
        dateOfBirth: dateService.formatShortGdsDate(p.dateOfBirth),
        foreName: p.foreName,
        lastName: p.lastName,
        middleNames: p.middleNames
      }
    }
  }))
  pupils = pupils.filter(p => !!p)
  if (pupils.length === 0) return []
  // determine if more than one pupil has same full name
  pupils = pupilIdentificationFlagService.addIdentificationFlags(pupils)
  return pupils
}

/**
 * Find groups that have pupils that can get PINs assigned.
 * @param schoolId
 * @param pupils
 * @returns {Promise<*>}
 */
pinGenerationService.filterGroups = async (schoolId, pupils) => {
  let pupilIds = ''
  if (pupils.length > 0) {
    pupils.map(p => { if (p.group_id) pupilIds += "'" + p.group_id + "', " })
    pupilIds = pupilIds.length > 0 ? pupilIds.substr(0, pupilIds.length - 2) : ''
  }
  return groupDataService.sqlFindGroupsByIds(schoolId, pupilIds)
}

/**
 * Determine if pupil is valid for pin generation
 * @param p
 * @returns {Boolean}
 */
pinGenerationService.isValid = async (p) => {
  const checkCount = await checkDataService.sqlFindNumberOfChecksStartedByPupil(p.id)
  const pupilAttendance = await pupilAttendanceDataService.findOneByPupilId(p.id)
  const hasAttendance = pupilAttendance && pupilAttendance.attendanceCode_id
  if (checkCount === restartService.totalChecksAllowed) return false
  const canRestart = await restartService.canRestart(p.id)
  return !pinValidator.isActivePin(p.pin, p.pinExpiresAt) && !hasAttendance && !canRestart
}

/**
 * Generate pupils pins
 * @param pupilsList
 * @param dfeNumber
 * @returns {Array}
 */
pinGenerationService.updatePupilPins = async (pupilsList, dfeNumber) => {
  let ids = Object.values(pupilsList || null)
  ids = ids.map(i => parseInt(i))
  const pupils = await pupilDataService.sqlFindByIds(ids)
  pupils.forEach(pupil => {
    if (!pinValidator.isActivePin(pupil.pin, pupil.pinExpiresAt)) {
      pupil.pin = pinGenerationService.generatePupilPin()
      pupil.pinExpiresAt = pinExpiryTime()
    }
  })
  const data = pupils.map(p => ({ id: p.id, pin: p.pin, pinExpiresAt: p.pinExpiresAt }))
  try {
    await pupilDataService.sqlUpdatePinsBatch(data)
  } catch (error) {
    // Handle duplicate pins
    if (error.number === 2601 &&
      pinGenerationService.pinSubmissionAttempts < pinGenerationService.pinSubmissionMaxAttempts) {
      pinGenerationService.pinSubmissionAttempts += 1
      const pupilsWithActivePins = await pupilDataService.sqlFindPupilsWithActivePins(dfeNumber)
      const pupilIdsWithActivePins = pupilsWithActivePins.map(p => p.id)
      const pendingPupilIds = R.difference(ids, pupilIdsWithActivePins)
      await pinGenerationService.updatePupilPins(pendingPupilIds, dfeNumber)
    } else {
      pinGenerationService.pinSubmissionAttempts = 0
      throw new Error(`${pinGenerationService.pinSubmissionMaxAttempts} allowed attempts 
      for pin generation resubmission have been reached`)
    }
  }
}

/**
 * Generate school password
 * @param school
 * @returns { pin: string, pinExpiresAt: Moment } || undefined
 */
pinGenerationService.generateSchoolPassword = (school) => {
  if (allowedWords.size < 5) {
    throw new Error('Service is incorrectly configured')
  }
  if (pinValidator.isActivePin(school.pin, school.pinExpiresAt)) {
    return undefined
  }
  const wordsArray = Array.from(allowedWords)
  const firstRandomWord = wordsArray[pinGenerationService.generateCryptoRandomNumber(0, wordsArray.length - 1)]
  const secondRandomWord = wordsArray[pinGenerationService.generateCryptoRandomNumber(0, wordsArray.length - 1)]
  const numberCombination = randomGenerator.getRandom(2, chars)
  const newPin = `${firstRandomWord}${numberCombination}${secondRandomWord}`
  const newExpiry = pinExpiryTime()
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
  let result = Math.floor(randBytes / maxDec * (maximum - minimum + 1) + minimum)
  return result
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
