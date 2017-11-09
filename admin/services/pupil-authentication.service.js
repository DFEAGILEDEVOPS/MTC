'use strict'
const dateService = require('../services/date.service')
const schoolDataService = require('../services/data-access/school.data.service')
const pupilDataService = require('../services/data-access/pupil.data.service')
const generatePinsValidationService = require('../services/generate-pins-validation.service')

const pupilAuthenticationService = {
  /**
   * Authenticate a pupil from the school pin and pupil pin
   * @param pupilPin
   * @param schoolPin
   * @return {Promise.<Pupil>}
   */
  authenticate: async (pupilPin, schoolPin) => {
    const school = await schoolDataService.findOne({schoolPin: schoolPin})
    const pupil = await pupilDataService.findOne({
      pin: pupilPin,
      school: school && school._id
    })
    if (!pupil || !school || !generatePinsValidationService.isValidPin(pupil.pin, pupil.pinExpiresAt)) {
      throw new Error('Authentication failure')
    }
    return pupil
  },

  getPupilDataForSpa: (pupil) => {
    const pupilData = {
      firstName: pupil.foreName,
      lastName: pupil.lastName,
      dob: dateService.formatFullGdsDate(pupil.dob)
    }
    return pupilData
  }
}

module.exports = pupilAuthenticationService
