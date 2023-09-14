'use strict'

const dataService = require('./data-access/school-pin.data.service')

const service = {
  /**
   * @description calls the school pin http service to allocate a school pin on demand
   * @param {uuid.v4} urlSlug the unique uuid of the school
   * @returns {Promise<string>} generated school pin
   */
  generateSchoolPin: async (schoolId) => {
    if (!schoolId) {
      throw new Error('schoolId is required')
    }
    return dataService.callFunctionApi(schoolId)
  }
}

module.exports = service
