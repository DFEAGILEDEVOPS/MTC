const moment = require('moment')
const R = require('ramda')
const pupilDataService = require('../services/data-access/pupil.data.service')
const randomGenerator = require('../lib/random-generator')
const pinValidator = require('../lib/validator/pin-validator')
const config = require('../config')

const fourPmToday = () => moment().startOf('day').add(16, 'hours')

const pinExpiryTime = () => {
  if (config.OverridePinExpiry) {
    return moment().endOf('day')
  }
  return fourPmToday()
}

const pinGenerationService = {}
const chars = '23456789'

/**
 * Generate pupils pins
 * @param pupilsList
 * @param dfeNumber
 * @param maxAttempts
 * @param attemptsRemaining
 */
pinGenerationService.updatePupilPins = async (pupilsList, dfeNumber, maxAttempts, attemptsRemaining) => {
  if (!Array.isArray(pupilsList)) {
    throw new Error('Received list of pupils is not an array')
  }
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
    if (attemptsRemaining === 0) {
      throw new Error(`${maxAttempts} allowed attempts 
      for pin generation resubmission have been reached`)
    }
    // Handle duplicate pins
    if (error.number === 2601 && attemptsRemaining !== 0) {
      attemptsRemaining -= 1
      const pupilsWithActivePins = await pupilDataService.sqlFindPupilsWithActivePins(dfeNumber)
      const pupilIdsWithActivePins = pupilsWithActivePins.map(p => p.id)
      const pendingPupilIds = R.difference(ids, pupilIdsWithActivePins)
      await pinGenerationService.updatePupilPins(pendingPupilIds, dfeNumber, maxAttempts, attemptsRemaining)
    } else {
      throw new Error(error)
    }
  }
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
