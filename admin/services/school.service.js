const schoolDataService = require('../services/data-access/school.data.service')
const generatePinsValidationService = require('../services/generate-pins-validation.service')

const schoolService = {
  /**
   * Get active school Password
   * @param schoolId
   * @returns {String}
   */
  getActiveSchool: async (schoolId) => {
    const school = await schoolDataService.findOne({_id: schoolId})
    if (!generatePinsValidationService.isValidPin(school.schoolPin, school.pinExpiresAt)) {
      return null
    }
    return school
  }
}

module.exports = schoolService
