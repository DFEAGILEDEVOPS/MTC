const schoolDataService = require('../services/data-access/school.data.service')
const generatePinService = require('../services/generate-pins.service')

const schoolService = {
  /**
   * Get active school Password
   * @param schoolId
   * @returns {String}
   */
  getActiveSchool: async (schoolId) => {
    const school = await schoolDataService.findOne({_id: schoolId})
    if (!generatePinService.isValidPin(school.schoolPin, school.pinExpiresAt)) {
      return null
    }
    return school
  }
}

module.exports = schoolService
