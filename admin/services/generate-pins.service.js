const moment = require('moment')
const pupilDataService = require('../services/data-access/pupil.data.service')
const randomGenerator = require('../lib/random-generator')
const mongoose = require('mongoose')
const generatePinsValidationService = require('../services/generate-pins-validation.service')
const pupilIdentificationFlagService = require('../services/pupil-identification-flag.service')

const fourPMToday = () => {
  return moment().startOf('day').add(16, 'hours')
}

const generatePinsService = {}

/**
 * Fetch pupils and filter required only pupil attributes
 * @param schoolId
 * @param sortField
 * @param sortDirection
 * @returns {Array}
 */
generatePinsService.getPupils = async (schoolId, sortField, sortDirection) => {
  let pupils = await pupilDataService.getSortedPupils(schoolId, sortField, sortDirection)
  // filter pupils
  pupils = pupils
    .filter(p => generatePinsService.removeInvalidPupils(p))
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
generatePinsService.removeInvalidPupils = (p) => !generatePinsValidationService.isValidPin(p.pin, p.pinExpiresAt) && !p.attendanceCode && !p.result

/**
 * Generate pupils pins
 * @param pupilsList
 * @returns {Array}
 */
generatePinsService.generatePupilPins = async (pupilsList) => {
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
    if (!generatePinsValidationService.isValidPin(pupil.pin, pupil.pinExpiresAt)) {
      const length = 5
      pupil.pin = generatePinsService.generateRandomPin(length)
      pupil.pinExpiresAt = fourPMToday()
    }
  })
  return pupils
}

/**
 * Generate school password
 * @param school
 * @returns {Object}
 */
generatePinsService.generateSchoolPassword = (school) => {
  let { schoolPin, pinExpiresAt } = school
  if (!generatePinsValidationService.isValidPin(schoolPin, pinExpiresAt)) {
    const length = 8
    school.schoolPin = generatePinsService.generateRandomPin(length)
    school.pinExpiresAt = fourPMToday()
  }
  return school
}

/**
 * Generate Random Pin
 * @param length
 * @returns {String}
 */
generatePinsService.generateRandomPin = (length) => {
  const chars = '23456789bcdfghjkmnpqrstvwxyz'
  return randomGenerator.getRandom(length, chars)
}

module.exports = generatePinsService
