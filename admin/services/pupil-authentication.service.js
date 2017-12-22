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
   * @return {Promise.<Pupil>}
   */
  authenticate: async (pupilPin, schoolPin) => {
    const school = await schoolDataService.sqlFindOneBySchoolPin(schoolPin)
    const pupil = await pupilDataService.findOne({
      pin: pupilPin,
      school: school && school.dfeNumber
    })
    if (!pupil || !school || !pinValidator.isActivePin(pupil.pin, pupil.pinExpiresAt)) {
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
