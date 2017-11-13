const moment = require('moment')
const pupilDataService = require('../services/data-access/pupil.data.service')
const randomGenerator = require('../lib/random-generator')
const mongoose = require('mongoose')
const pinValidator = require('../lib/validator/pin-validator')
const pupilIdentificationFlagService = require('../services/pupil-identification-flag.service')

const fourPmToday = () => {
  return moment().startOf('day').add(22, 'hours')
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
  pupils = pupils
    .filter(p => pinGenerationService.removeInvalidPupils(p))
    .map(({ _id, pin, dob, foreName, middleNames, lastName }) =>
      ({ _id, pin, dob: moment(dob).format('DD MMM YYYY'), foreName, middleNames, lastName }))
  // determine if more than one pupil has same full name
  pupils = pupilIdentificationFlagService.addIdentificationFlags(pupils)
  return pupils
}

/**
 * Determine if pupil is valid for pin generation
 * @param p
 * @returns {Boolean}
 */
pinGenerationService.removeInvalidPupils = (p) => !pinValidator.isValidPin(p.pin, p.pinExpiresAt) && !p.attendanceCode && !p.result

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
    if (!pinValidator.isValidPin(pupil.pin, pupil.pinExpiresAt)) {
      const length = 5
      pupil.pin = pinGenerationService.generateRandomPin(length)
      pupil.pinExpiresAt = fourPmToday()
    }
  })
  return pupils
}

/**
 * Generate school password
 * @param school
 * @returns {Object}
 */
pinGenerationService.generateSchoolPassword = (school) => {
  let { schoolPin, pinExpiresAt } = school
  if (!pinValidator.isValidPin(schoolPin, pinExpiresAt)) {
    const length = 8
    school.schoolPin = pinGenerationService.generateRandomPin(length)
    school.pinExpiresAt = fourPmToday()
  }
  return school
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
