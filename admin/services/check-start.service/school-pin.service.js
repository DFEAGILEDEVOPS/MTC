'use strict'

const dataService = require('./data-access/school-pin.data.service')

const service = {
  /**
   * @description calls the school pin http service to allocate a school pin on demand
   * @param {uuid/v4} urlSlug the unique uuid of the school
   * @returns {string} generated school pin
   */
  generateSchoolPin: async (urlSlug) => {
    if (!urlSlug) {
      throw new Error('urlSlug is required')
    }
    return dataService.callFunctionApi(urlSlug)
  }
}

module.exports = service
