const moment = require('moment')
const pupilDataService = require('../services/data-access/pupil.data.service')
const schoolDataService = require('../services/data-access/school.data.service')
const randomGenerator = require('../lib/random-generator')
const mongoose = require('mongoose')

const fourPMToday = () => {
  return moment().startOf('day').add(16, 'hours')
}

const generatePinService = {
  /**
   * Fetch pupils and filter required only pupil attributes
   * @param schoolId
   * @param sortField
   * @param sortDirection
   * @returns {Array}
   */
  getPupils: async (schoolId, sortField, sortDirection) => {
    let pupils = await pupilDataService.getSortedPupils(schoolId, sortField, sortDirection)
    // filter pupils
    pupils = pupils
      .filter(p => generatePinService.removeInvalidPupils(p))
      .map(({_id, pin, dob, foreName, middleNames, lastName}) =>
        ({ _id, pin, dob: moment(dob).format('DD MMM YYYY'), foreName, middleNames, lastName }))
    // determine if more than one pupil has same full name
    pupils.map((p, i) => {
      if (pupils[ i + 1 ] === undefined) return
      if (pupils[ i ].foreName === pupils[ i + 1 ].foreName &&
        pupils[ i ].lastName === pupils[ i + 1 ].lastName) {
        pupils[ i ].showDoB = true
        pupils[ i + 1 ].showDoB = true
      }
    })
    return pupils
  },

  /**
   * Determine if pupil is valid for pin generation
   * @param pupil
   * @returns {Boolean}
   */
  removeInvalidPupils: (p) =>
    !generatePinService.isValidPin(p.pin, p.pinExpiresAt) && !p.attendanceCode && !p.result,

  /**
   * Generate pupils pins
   * @param pupilList
   * @returns {Array}
   */
  generatePupilPins: async (pupilsList) => {
    const data = Object.values(pupilsList || null)
    let pupils = []
    // fetch pupils
    const ids = data.map(id => mongoose.Types.ObjectId(id))
    for (let index = 0; index < ids.length; index++) {
      const id = ids[index]
      const pupil = await pupilDataService.findOne(id)
      pupils.push(pupil)
    }
    // pupils = await pupilDataService.find({ _id: { $in: ids } })
    // Apply the updates to the pupil object(s)
    pupils.forEach(pupil => {
      if (!generatePinService.isValidPin(pupil.pin, pupil.pinExpiresAt)) {
        const length = 5
        pupil.pin = generatePinService.generateRandomPin(length)
        pupil.pinExpiresAt = fourPMToday()
      }
    })
    return pupils
  },

  /**
   * Generate school password
   * @param school
   * @returns {Object}
   */
  generateSchoolPassword: (school) => {
    let { schoolPin, pinExpiresAt } = school
    if (!generatePinService.isValidPin(schoolPin, pinExpiresAt)) {
      const length = 8
      school.schoolPin = generatePinService.generateRandomPin(length)
      school.pinExpiresAt = fourPMToday()
    }
    return school
  },

  /**
   * Validate pin
   * @param pin
   * @param pinExpiresAt
   * @returns {Boolean}
   */
  isValidPin: (pin, pinExpiresAt) => {
    if (!pinExpiresAt || !pin) return false
    return moment(pinExpiresAt).isAfter(moment.utc())
  },

  /**
   * Generate Random Pin
   * @param length
   * @returns {String}
   */
  generateRandomPin: (length) => {
    const chars = '23456789bcdfghjkmnpqrstvwxyz'
    return randomGenerator.getRandom(length, chars)
  },

  /**
   * Get active school Password
   * @param school
   * @returns {String}
   */
  getActiveSchool: async (schoolId) => {
    const school = await schoolDataService.findOne({_id: schoolId})
    if (!generatePinService.isValidPin(school.schoolPin, school.pinExpiresAt)) {
      return null
    }
    return school
  },

  /**
   * Get pupils with active pins
   * @param schoolId
   * @returns {Array}
   */
  getPupilsWithActivePins: async (schoolId) => {
    let pupils = await pupilDataService.getSortedPupils(schoolId, 'lastName', 'asc')
    pupils = pupils.filter(p => generatePinService.isValidPin(p.pin, p.pinExpiresAt))
    return pupils
  }
}

module.exports = generatePinService
