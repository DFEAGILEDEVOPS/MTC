const moment = require('moment')
const pupilDataService = require('../services/data-access/pupil.data.service')
const randomGenerator = require('../lib/random-generator')

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

  removeInvalidPupils: (p) =>
    !generatePinService.isValidPin(p.pin, p.pinExpiresAt) && !p.attendanceCode && !p.result,

  generatePupilPins: async (pupilsList) => {
    const data = Object.values(pupilsList || null)
    let pupils = []
    // fetch pupils
    const ids = data.map(id => id)
    pupils = await pupilDataService.find({ _id: { $in: ids } })
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

  generateSchoolPassword: (school) => {
    let { schoolPin, pinExpiresAt } = school
    if (!generatePinService.isValidPin(schoolPin, pinExpiresAt)) {
      const length = 8
      school.schoolPin = generatePinService.generateRandomPin(length)
      school.pinExpiresAt = fourPMToday()
    }
    return school
  },

  isValidPin: (pin, pinExpiresAt) => {
    if (!pinExpiresAt || !pin) return false
    return moment(pinExpiresAt).isAfter(moment.utc())
  },

  generateRandomPin: (length) => {
    const chars = '23456789bcdfghjkmnpqrstvwxyz'
    return randomGenerator.getRandom(length, chars)
  }
}

module.exports = generatePinService
