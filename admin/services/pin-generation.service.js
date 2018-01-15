const moment = require('moment')
const mongoose = require('mongoose')
const pupilDataService = require('../services/data-access/pupil.data.service')
const checkDataService = require('../services/data-access/check.data.service')
const randomGenerator = require('../lib/random-generator')
const pinValidator = require('../lib/validator/pin-validator')
const pupilIdentificationFlagService = require('../services/pupil-identification-flag.service')
const restartService = require('../services/restart.service')
const dateService = require('../services/date.service')

const fourPmToday = () => {
  return moment().startOf('day').add(16, 'hours')
}

const pinGenerationService = {}

/**
 * Fetch pupils and filter required only pupil attributes
 * @param schoolId
 * @param sortField
 * @param sortDirection
 * @returns {Array}
 */
pinGenerationService.getPupils = async (schoolId, sortField, sortDirection) => {
  let pupils = await pupilDataService.getSortedPupils(schoolId, sortField, sortDirection)
  // filter pupils
  pupils = await Promise.all(pupils.map(async p => {
    const isValid = await pinGenerationService.isValid(p)
    if (isValid) {
      return {
        _id: p._id,
        pin: p.pin,
        dob: dateService.formatShortGdsDate(p.dob),
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
 * Determine if pupil is valid for pin generation
 * @param p
 * @returns {Boolean}
 */
pinGenerationService.isValid = async (p) => {
  const checkCount = await checkDataService.sqlGetNumberOfChecksStartedByPupil(p._id)
  if (checkCount === restartService.totalChecksAllowed) return false
  const canRestart = await restartService.canRestart(p._id)
  return !pinValidator.isActivePin(p.pin, p.pinExpiresAt) && !p.attendanceCode && !canRestart
}

/**
 * Generate pupils pins
 * @param pupilsList
 * @returns {Array}
 */
pinGenerationService.generatePupilPins = async (pupilsList) => {
  const data = Object.values(pupilsList || null)
  let pupils = []
  // fetch pupils
  const ids = data.map(id => mongoose.Types.ObjectId(id))
  for (let index = 0; index < ids.length; index++) {
    const id = ids[ index ]
    const pupil = await pupilDataService.findOne(id)
    pupils.push(pupil)
  }
  // pupils = await pupilDataService.find({ _id: { $in: ids } })
  // Apply the updates to the pupil object(s)
  pupils.forEach(pupil => {
    if (!pinValidator.isActivePin(pupil.pin, pupil.pinExpiresAt)) {
      pupil.pin = pinGenerationService.generatePupilPin()
      pupil.pinExpiresAt = fourPmToday()
    }
  })
  return pupils
}

/**
 * Generate school password
 * @param school
 * @returns { pin: string, pinExpiresAt: Moment } || undefined
 */
pinGenerationService.generateSchoolPassword = (school) => {
  if (pinValidator.isActivePin(school.pin, school.pinExpiresAt)) {
    return undefined
  }
  const length = 8
  const newPin = pinGenerationService.generateRandomPin(length)
  const newExpiry = fourPmToday()
  return { pin: newPin, pinExpiresAt: newExpiry }
}

/**
 * Generate Pupil Pin
 * @returns {String}
 */
pinGenerationService.generatePupilPin = () => {
  const chars = '23456789'
  return randomGenerator.getRandom(4, chars)
}

/**
 * Generate Random Pin
 * @param length
 * @returns {String}
 */
pinGenerationService.generateRandomPin = (length) => {
  const chars = '23456789bcdfghjkmnpqrstvwxyz'
  return randomGenerator.getRandom(length, chars)
}

module.exports = pinGenerationService
