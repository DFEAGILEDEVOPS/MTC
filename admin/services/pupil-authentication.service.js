'use strict'
const dateService = require('../services/date.service')
const schoolDataService = require('../services/data-access/school.data.service')
const pupilDataService = require('../services/data-access/pupil.data.service')
const pinValidator = require('../lib/validator/pin-validator')
const monitor = require('../helpers/monitor')

const pupilAuthenticationService = {
  /**
   * Authenticate a pupil from the school pin and pupil pin
   * @param pupilPin
   * @param schoolPin
   * @return {object}
   */
  authenticate: async (pupilPin, schoolPin) => {
    // TODO: Consolidate the following data layer calls to a single one
    const school = await schoolDataService.sqlFindOneBySchoolPin(schoolPin)
    if (!school) {
      throw new Error('Authentication failure')
    }
    const pupil = await pupilDataService.sqlFindOneByPinAndSchool(pupilPin, school.id)
    if (!pupil || !pinValidator.isActivePin(pupil.pin, pupil.pinExpiresAt)) {
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

module.exports = monitor('pupil-authentication.service', pupilAuthenticationService)
