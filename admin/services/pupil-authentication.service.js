'use strict'
const School = require('../models/school')
const Pupil = require('../models/pupil')
const dateService = require('../services/date.service')

const pupilAuthenticationService = {
  /**
   * Authenticate a pupil from the school pin and pupil pin
   * @param pupilPin
   * @param schoolPin
   * @return {Promise.<Pupil>}
   */
  authenticate: async (pupilPin, schoolPin) => {
    let school, pupil
    // Until we determine the logic behind fetching the appropriate check form
    // the pupil will receive the first one
    school = await School.findOne({schoolPin: schoolPin}).lean().exec()
    pupil = await Pupil.findOne({
      pin: pupilPin,
      school: school && school._id,
      pinExpired: false,
      hasAttended: false
    }).populate('school').exec()
    if (!pupil || !school) {
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
