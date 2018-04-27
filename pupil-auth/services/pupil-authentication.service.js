'use strict'
const dateService = require('../services/date.service')
const schoolDataService = require('../services/data-access/school.data.service')
const pupilDataService = require('../services/data-access/pupil.data.service')
const pinValidator = require('../lib/validator/pin-validator')

const pupilAuthenticationService = {
  /**
   * Authenticate a pupil from the school pin and pupil pin
   * @param pupilPin
   * @param schoolPin
   * @return {object}
   */
  authenticate: async (pupilPin, schoolPin) => {

    const { pupil, school } = await pupilDataService.sqlFindOneByPinAndSchoolPin(pupilPin, schoolPin)

    if (!school || !pupil || !pinValidator.isActivePin(pupil.pin, pupil.pinExpiresAt)) {
      throw new Error('Authentication failure')
    }

    return { pupil, school }
  },

  getPupilDataForSpa: (pupil) => {
    return {
      firstName: pupil.foreName,
      lastName: pupil.lastName,
      dob: dateService.formatFullGdsDate(pupil.dateOfBirth)
    }
  }
}

module.exports = pupilAuthenticationService
